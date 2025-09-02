import { createServerFileRoute } from '@tanstack/react-start/server';
import { fetchAuth } from '~/routes/__root';
import { z } from 'zod';
import sharp from 'sharp';
import { Id } from 'convex/_generated/dataModel';
import { api } from 'convex/_generated/api';
import { convex } from '~/services/convex-http-client';

const dataSchema = z.array(z.instanceof(File));

export interface MediaVariant {
  name: string;
  width?: number;
  height?: number;
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
}

const DEFAULT_VARIANTS: MediaVariant[] = [
  { name: 'thumbnail', width: 150, height: 150, quality: 80, format: 'webp' },
  { name: 'small', width: 400, quality: 85, format: 'webp' },
  { name: 'medium', width: 800, quality: 85, format: 'webp' },
  { name: 'large', width: 1200, quality: 90, format: 'webp' },
  { name: 'original_webp', quality: 95, format: 'webp' },
];

async function optimizeImage({
  sharp,
  options,
}: {
  sharp: sharp.Sharp;
  options: {
    quality: number;
    format: MediaVariant['format'];
  };
}) {
  switch (options.format) {
    case 'png':
      return sharp.png(options).toBuffer();
    case 'webp':
      return sharp.png(options).toBuffer();
    case 'avif':
      return sharp.avif(options).toBuffer();
    case 'jpeg':
      return sharp.jpeg(options).toBuffer();
  }
}

async function processImage(inputFile: File) {
  const inputBuffer = Buffer.from(await inputFile.arrayBuffer());

  const originalFilename = inputFile.name;
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image: unknown dimensions');
  }

  const format = metadata.format;
  const originalOptimized = await optimizeImage({
    sharp: image,
    options: { quality: 95, format: format as MediaVariant['format'] },
  });

  const processedImages = [];

  for (const variant of DEFAULT_VARIANTS) {
    const clone = image.clone();
    const resizedImage = clone.resize(variant.width, variant.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    const processedVariantBuffer = await optimizeImage({
      sharp: resizedImage,
      options: variant,
    });
    const metadata = await sharp(processedVariantBuffer).metadata();

    const processedVariant = {
      variantName: variant.name,
      buffer: processedVariantBuffer,
      filename: '',
      mimeType: `image/${variant.format}`,
      size: processedVariantBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };
    processedImages.push(processedVariant);
  }

  return {
    originalOptimized,
    originalFilename,
    processedImages,
  };
}

export const ServerRoute = createServerFileRoute('/api/media/').methods({
  POST: async ({ request }) => {
    try {
      const auth = await fetchAuth();
      if (!auth)
        return new Response(
          JSON.stringify({ message: 'Unauthorized requiest' }),
          {
            status: 403,
            statusText: 'Forbidden',
          },
        );

      const formData = await request.formData();
      const imageData = formData.getAll('files[]');
      const { data, error, success } = dataSchema.safeParse(imageData);
      if (error) {
        return new Response(JSON.stringify({ message: error.message }), {
          status: 400,
        });
      } else if (success) {
        const mediaIds: Id<'media'>[] = [];
        for (const file of data) {
          await processImage(file).then(async (img) => {
            // upload to convex in bg
            const mediaId = await convex.mutation(api.media.mutateMedia, {
              fileName: img.originalFilename,
            });
            mediaIds.push(mediaId);
          });
        }
        return new Response(JSON.stringify({ mediaIds }), {
          status: 200,
        });
      } else {
        return new Response(
          JSON.stringify({ message: 'Internal Server Error' }),
          { status: 500 },
        );
      }
    } catch (err) {
      console.log(err);
      return new Response(
        JSON.stringify({ message: 'Internal Server Error' }),
        { status: 500 },
      );
    }
  },
});

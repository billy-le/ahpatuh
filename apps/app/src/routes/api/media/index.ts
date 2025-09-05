import { createServerFileRoute } from '@tanstack/react-start/server';
import { fetchAuth } from 'src/routes/__root';
import { z } from 'zod';
import sharp from 'sharp';
import { Id } from '@ahpatuh/convex/_generated/dataModel';
import { api } from '@ahpatuh/convex/_generated/api';
import { convex } from 'src/services/convex-http-client';
import { FunctionReturnType } from 'convex/server';

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

  const processedImages = [
    {
      buffer: originalOptimized,
      filename: originalFilename,
      mimeType: `image/${format}`,
      size: originalOptimized.length,
      width: metadata.width,
      height: metadata.height,
    },
  ];

  const filenameWithoutExt = originalFilename.replace(`.${format}`, '');

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
      buffer: processedVariantBuffer,
      filename: `${filenameWithoutExt}_${variant.name}.${variant.format}`,
      mimeType: `image/${variant.format}`,
      size: processedVariantBuffer.length,
      width: metadata.width,
      height: metadata.height,
    };
    processedImages.push(processedVariant);
  }

  return processedImages;
}

export const ServerRoute = createServerFileRoute('/api/media/').methods({
  POST: async ({ request }) => {
    try {
      // check auth is coming from client or user-domain
      const auth = await fetchAuth();
      const token =
        auth.token ||
        request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return new Response(
          JSON.stringify({ message: 'Unauthorized requiest' }),
          {
            status: 403,
            statusText: 'Forbidden',
          },
        );
      }
      // set the auth token for Convex to make HTTP queries with.
      if (token) {
        convex.setAuth(token);
      }

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
          const mediaId = await convex.mutation(api.media.mutateMedia, {
            fileName: file.name,
          });
          if (!mediaId)
            return new Response(
              JSON.stringify({
                message: 'Internal Server Error',
                reason: 'Unable to create media',
              }),
              {
                status: 500,
              },
            );
          mediaIds.push(mediaId);
          // convert all images to variants and then upload them to convex
          // after uploaded completed, store the storageId
          // don't await, process in bg
          processImage(file).then(async (processedImages) => {
            for (const image of processedImages) {
              let arrayBuffer: ArrayBuffer;
              if (image.buffer instanceof Buffer) {
                const buffer = image.buffer;
                arrayBuffer = buffer.buffer.slice(
                  buffer.byteOffset,
                  buffer.byteOffset + buffer.byteLength,
                ) as ArrayBuffer;
              } else if (image.buffer instanceof ArrayBuffer) {
                arrayBuffer = image.buffer;
              } else {
                const buffer = image.buffer;
                arrayBuffer = buffer.buffer.slice(
                  buffer.byteOffset,
                  buffer.byteOffset + buffer.byteLength,
                ) as ArrayBuffer;
              }
              const uploadUrl = await convex.mutation(
                api.media.generateUploadUrl,
              );
              const uploadResults = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': image.mimeType },
                body: new Blob([arrayBuffer], { type: image.mimeType }),
              });
              const { storageId }: { storageId: Id<'_storage'> } =
                await uploadResults.json();
              const storageUrl = await convex.query(api.storage.getStorageUrl, {
                _id: storageId,
              });
              if (!storageUrl) {
                throw new Error('Storage URL not found');
              }
              // create media variant
              const variantId: FunctionReturnType<
                typeof api.mediaVariants.mutateMediaVariant
              > = await convex.mutation(api.mediaVariants.mutateMediaVariant, {
                fileName: image.filename,
                width: image.width,
                height: image.height,
                mimeType: image.mimeType,
                storageId,
                url: storageUrl,
              });
              // create relation from media to media variants
              convex
                .mutation(api.mediaMediaVariants.createMediaMediaVariant, {
                  mediaId,
                  mediaVariantId: variantId,
                })
                .then(async () => {
                  await convex.mutation(api.media.updateMediaStatus, {
                    _id: mediaId,
                    status: 'READY',
                  });
                })
                .catch(async (err) => {
                  console.log(err);
                  await convex.mutation(api.media.updateMediaStatus, {
                    _id: mediaId,
                    status: 'FAILED',
                  });
                });
            }
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

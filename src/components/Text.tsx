import { cx } from '~/lib/cva';

interface TextProps extends React.PropsWithChildren {
  el: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  className?: string;
}
export function Text({ el, children, className }: TextProps) {
  switch (el) {
    case 'h1':
      return (
        <h1 className={cx('text-3xl font-medium', className)}>{children}</h1>
      );
    case 'h2':
      return <h2 className={cx('text-2xl', className)}>{children}</h2>;
    case 'h3':
      return <h3 className={cx('', className)}>{children}</h3>;
    case 'h4':
      return <h4 className={cx('', className)}>{children}</h4>;
    case 'h5':
      return <h5 className={cx('', className)}>{children}</h5>;
    case 'h6':
      return <h6 className={cx('', className)}>{children}</h6>;
    case 'p':
      return <p className={cx('', className)}>{children}</p>;
  }
}

import HeroBlock from './HeroBlock.jsx';
import SimpleTextBlock from './SimpleTextBlock.jsx';
import GalleryBlock from './GalleryBlock.jsx';
import PriceTableBlock from './PriceTableBlock.jsx';
import LowPriceFormBlock from './LowPriceFormBlock.jsx';
import ZamerBlock from './ZamerBlock.jsx';

const BLOCK_MAP = {
  hero: HeroBlock,
  simple_text: SimpleTextBlock,
  gallery: GalleryBlock,
  pr_table: PriceTableBlock,
  form_low_price: LowPriceFormBlock,
  zamer: ZamerBlock,
};

export default function BlockRenderer({ blocks = [], entityMedia = null }) {
  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <>
      {sorted.map((block, index) => {
        const Component = BLOCK_MAP[block.type];
        if (!Component) {
          return (
            <div key={block.id ?? index} className="section block-unsupported" data-block-type={block.type}>
              <div className="container">Block type &quot;{block.type}&quot; not supported</div>
            </div>
          );
        }
        return (
          <Component
            key={block.id ?? `${block.type}-${index}`}
            data={block.data || {}}
            entityMedia={entityMedia}
          />
        );
      })}
    </>
  );
}

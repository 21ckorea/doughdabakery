import Image from 'next/image';
import { Product } from '@/types/product';

export default function ProductCard(props: Product) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative aspect-w-16 aspect-h-9 h-48">
        {props.image && (
          <Image
            src={props.image}
            alt={props.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{props.name}</h3>
          {props.isSoldOut && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              품절
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{props.description}</p>
        <p className="text-lg font-bold">{props.price.toLocaleString()}원</p>
      </div>
    </div>
  );
} 
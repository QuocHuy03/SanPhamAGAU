import React, { useState } from 'react';
// import './ProductDetail.css';

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col space-y-4">
      <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-inner">
        <img
          src={images[selectedImage]}
          alt="Main product"
          className="h-full w-full object-cover object-center transition-opacity duration-500"
        />
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 ${index === selectedImage ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
            onClick={() => setSelectedImage(index)}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
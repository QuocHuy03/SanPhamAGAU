import React, { useState } from 'react';
// import './ProductDetail.css';

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-100 ring-1 ring-black/5 cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          key={selectedImage}
          src={images[selectedImage]?.url || images[selectedImage]}
          alt="Main product"
          style={zoomStyle}
          className="h-full w-full object-cover object-center animate-fade-in transition-transform duration-200 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      </div>

      <div className="flex space-x-4 overflow-x-auto py-2 px-1 hide-scrollbar snap-x">
        {images.map((image, index) => {
          const imgSrc = image?.url || image;
          return (
            <div
              key={index}
              className={`relative h-24 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-500 snap-center ${index === selectedImage
                ? 'border-indigo-500 shadow-lg shadow-indigo-100 -translate-y-1'
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-indigo-200'
                }`}
              onClick={() => setSelectedImage(index)}
            >
              <img src={imgSrc} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
              {index === selectedImage && (
                <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGallery;
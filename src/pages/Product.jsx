import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { createDataFunc, updateDataFunc } from '../redux/dataSlice';
import { modalFunc } from '../redux/modalSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Product = () => {
  const {modal} = useSelector(state => state.modal);
  const {data, keyword} = useSelector(state => state.data);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const updateId = searchParams.get("update");
  const navigate = useNavigate();

  const [productInfo, setProductInfo] = useState({ id: "", name: "", price:"", url: "" });

  useEffect(() => {
    if (updateId) {
      // **Güncelleme Modunda Ürün Bilgilerini Getir**
      const foundProduct = data.find(dt => dt.id === Number(updateId));
      if (foundProduct) {
        setProductInfo(foundProduct);
      }
    } else {
      // **Yeni Ürün Modunda Boş State Kullan**
      setProductInfo({ id: "", name: "", price: "", url: "" });
    }
  }, [updateId, data]);

  const onChangeFunc = (e, type) => {
    const { name, files, value } = e.target;
  
    if (type === "url") {
      if (files.length === 0) return;
  
      const file = files[0];
  
      // **Dosya Türü Kontrolü**
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Sadece JPG, PNG ve GIF dosyaları yükleyebilirsiniz.");
        e.target.value = "";
        return;
      }
  
      // **Büyük Dosya Boyutları için Optimize Etme**
      if (file.size > 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
  
            // **Resmi Yeniden Boyutlandır**
            let width = img.width;
            let height = img.height;
            const maxSize = 1024; // Maksimum genişlik/yükseklik (Örn: 1024px)
  
            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }  
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
  
            // **Yeniden sıkıştırılmış resmi al**
            canvas.toBlob((blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
  
              // **Geçici URL Oluştur ve Kaydet**
              setProductInfo((prev) => ({
                ...prev,
                [name]: URL.createObjectURL(compressedFile),
              }));
            }, file.type, 0.8); // **Kalite oranı (%80)**
          };
        };
      } else {
        // **Dosya küçükse doğrudan yükle**
        setProductInfo((prev) => ({
          ...prev,
          [name]: URL.createObjectURL(file),
        }));
      }
    } else {
      setProductInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };  

  const buttonFunc = () => {
    dispatch(createDataFunc({ ...productInfo, id: data.length + 1 }));
    dispatch(modalFunc());
  };

  const buttonUpdateFunc = () => {
    if (updateId) {
      dispatch(updateDataFunc({ ...productInfo, id: Number(updateId) }));
      dispatch(modalFunc());
      navigate('/');
    }
  }; 

  const contentModal = (
    <>
          <Input value={productInfo.name || ""} type="text" placeholder="Ürün Ekle" name="name" id="name" onChange={e => onChangeFunc(e, "name")}/>
          <Input value={productInfo.price || ""} type="text" placeholder="Fiyat Ekle" name="price" id="price" onChange={e => onChangeFunc(e, "price")}/>
          <Input type="file" placeholder="Resim Seç" name="url" id="url" accept="image/gif, image/jpeg, image/png" onChange={e => onChangeFunc(e, "url")}/>
          <Button btnText={updateId ? "Ürün Güncelle" : "Ürün Oluştur"} onClick={updateId ? buttonUpdateFunc : buttonFunc}/>
    </>
  );

  const filteredItems = data.filter(dt => dt.name.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div>
      <div className='flex items-center flex-wrap mt-4'>
        {
          filteredItems.map((dt,i) => (
            <ProductCard key={i} dt={dt} setProductInfo={setProductInfo} />
          ))
        }
      </div>      
      {modal && <Modal content={contentModal} title={updateId ? "Ürün Güncelle" : "Ürün Oluştur"}/>}
    </div>
  );
};

export default Product;
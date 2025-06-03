'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Calendar from './components/Calendar';
import ProductCard from './components/ProductCard';
import { Holiday } from '@/types/holiday';
import { Product } from '@/types/product';
import { StoreStatus } from '@/types/store';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isOpen: true,
    message: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    fetchStoreStatus();
    fetchProducts();
    fetchHolidays();
  }, []);

  const fetchStoreStatus = async () => {
    try {
      const response = await fetch('/api/store');
      if (response.ok) {
        const data = await response.json();
        setStoreStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <Image
          src="/images/hero-bakery.jpg"
          alt="도우다 베이커리"
          fill
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 text-center text-white"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            도우다 베이커리
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-xl md:text-2xl mb-8"
          >
            매일 신선한 천연발효종으로 만드는 건강한 빵
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="space-y-2"
          >
            <button
              className={`px-6 py-3 rounded-full text-lg font-semibold ${
                storeStatus.isOpen
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {storeStatus.isOpen ? '영업중' : '영업종료'}
            </button>
            {storeStatus.message && (
              <p className="text-white text-center bg-black/50 px-4 py-2 rounded">
                {storeStatus.message}
              </p>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        id="products"
        className="py-16 px-4 max-w-7xl mx-auto"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-bold text-center mb-12"
        >
          오늘의 빵
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </motion.section>

      {/* Calendar Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        id="calendar"
        className="bg-gray-50 py-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-center mb-12"
          >
            영업 일정
          </motion.h2>
          <Calendar holidays={holidays} />
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
        id="contact"
        className="py-16 px-4 max-w-7xl mx-auto"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-bold text-center mb-12"
        >
          찾아오시는 길
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold">영업 시간</h3>
            <p>화요일 - 일요일: 10:00 AM - 8:00 PM</p>
            <p>월요일: 휴무</p>
            <p className="text-gray-600">* 재료 소진 시 조기 마감될 수 있습니다</p>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold">연락처</h3>
            <p>주소: [베이커리 주소]</p>
            <p>전화: [전화번호]</p>
            <p>이메일: [이메일]</p>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

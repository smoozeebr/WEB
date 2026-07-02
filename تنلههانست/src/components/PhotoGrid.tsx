import React from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles, Heart, Check, ZoomIn } from 'lucide-react';

interface PhotoGridProps {
  selectedColor: 'pink' | 'purple' | 'black' | 'any';
}

interface CollageItem {
  id: string;
  src: string;
  aspect: string;
  color: 'pink' | 'purple' | 'black' | 'any';
  title: string;
  subtitle: string;
}

// 20 elements carefully mapped to our high-resolution assets, mimicking the multi-photo dense masonry layout in the user's screenshot
const COLLAGE_ITEMS: CollageItem[] = [
  {
    id: 'collage-1',
    src: '/src/assets/images/smooziee_three_brushes_1782954552918.jpg',
    aspect: 'aspect-[3/4]',
    color: 'any',
    title: 'عائلة سموزيس الكاملة',
    subtitle: 'تناغم الألوان على الكتان الناعم'
  },
  {
    id: 'collage-2',
    src: '/src/assets/images/smooziee_pink_brush_1782954185981.jpg',
    aspect: 'aspect-[4/5]',
    color: 'pink',
    title: 'الوردي اللؤلؤي الناعم',
    subtitle: 'ألياف الحرير والنايلون الفاخر'
  },
  {
    id: 'collage-3',
    src: '/src/assets/images/smooziee_purple_box_1782954200836.jpg',
    aspect: 'aspect-[2/3]',
    color: 'purple',
    title: 'الخزامى الملكي الساحر',
    subtitle: 'مبطن بالساتان لروتين ملكي'
  },
  {
    id: 'collage-4',
    src: '/src/assets/images/smooziee_glove_box_1782954529608.jpg',
    aspect: 'aspect-square',
    color: 'pink',
    title: 'تجربة الفخامة والإهداء',
    subtitle: 'تغليف راقي يليق بمناسباتكِ'
  },
  {
    id: 'collage-5',
    src: '/src/assets/images/smooziee_black_silk_1782954504154.jpg',
    aspect: 'aspect-[3/4]',
    color: 'black',
    title: 'الأسود الأنيق الفخم',
    subtitle: 'سحر الطبيعة والغموض الفاخر'
  },
  {
    id: 'collage-6',
    src: '/src/assets/images/smooziee_purple_moody_1782954516032.jpg',
    aspect: 'aspect-[4/5]',
    color: 'purple',
    title: 'موف مخملي تحت الضوء',
    subtitle: 'تدليك وتنشيط لبصيلات الشعر'
  },
  {
    id: 'collage-7',
    src: '/src/assets/images/smooziee_clear_pink_1782955068370.jpg',
    aspect: 'aspect-[3/4]',
    color: 'pink',
    title: 'الشفاف الثلجي النقي',
    subtitle: 'لمعان ونعومة فورية مع انعكاسات النور'
  },
  {
    id: 'collage-8',
    src: '/src/assets/images/smooziee_glove_purple_1782955081644.jpg',
    aspect: 'aspect-[4/5]',
    color: 'purple',
    title: 'الخزامى الفاتن بالقفاز المخملي',
    subtitle: 'اهتمام وحب يحيط بكل فرشاة'
  },
  {
    id: 'collage-9',
    src: '/src/assets/images/smooziee_flatlay_pink_1782955093785.jpg',
    aspect: 'aspect-square',
    color: 'pink',
    title: 'روتين الاسترخاء والدلال',
    subtitle: 'مع غطاء العين الساتان واللافندر الطبيعي'
  },
  {
    id: 'collage-10',
    src: '/src/assets/images/smooziee_macro_bristles_1782955105387.jpg',
    aspect: 'aspect-[2/3]',
    color: 'any',
    title: 'دقة وتفاصيل الشعيرات الهجينة',
    subtitle: 'مزيج شعيرات الحرير والنايلون المرن'
  },
  {
    id: 'collage-11',
    src: '/src/assets/images/smooziee_four_brushes_1782954212654.jpg',
    aspect: 'aspect-[3/4]',
    color: 'any',
    title: 'تشكيلة الإطلاق الرسمية',
    subtitle: '٤ درجات مستوحاة من الأنوثة'
  },
  {
    id: 'collage-12',
    src: '/src/assets/images/smooziee_pink_dropper_1782954541196.jpg',
    aspect: 'aspect-[2/3]',
    color: 'pink',
    title: 'روتين العناية المتكامل',
    subtitle: 'فرشاة حريرية مع قطرات الزيت المغذي'
  },
  {
    id: 'collage-13',
    src: '/src/assets/images/smooziee_gift_box_1782954223561.jpg',
    aspect: 'aspect-square',
    color: 'pink',
    title: 'علبة سموزيس مطرزة بالذهب',
    subtitle: 'تصميم فرنسي خالص للإصدار المحدود'
  },
  {
    id: 'collage-14',
    src: '/src/assets/images/smooziee_three_brushes_1782954552918.jpg',
    aspect: 'aspect-square',
    color: 'any',
    title: 'الألوان الثلاثة الفاخرة',
    subtitle: 'اختاري ما يعبر عن شخصيتكِ'
  },
  {
    id: 'collage-15',
    src: '/src/assets/images/smooziee_purple_box_1782954200836.jpg',
    aspect: 'aspect-[3/4]',
    color: 'purple',
    title: 'موف مع علبة مخملية ورقية',
    subtitle: 'الهدية المثالية لمن تحبين'
  },
  {
    id: 'collage-16',
    src: '/src/assets/images/smooziee_pink_brush_1782954185981.jpg',
    aspect: 'aspect-[2/3]',
    color: 'pink',
    title: 'مقاومة كاملة للشحنات',
    subtitle: 'وداعاً لتطاير الشعر والتقصف'
  },
  {
    id: 'collage-17',
    src: '/src/assets/images/smooziee_clear_pink_1782955068370.jpg',
    aspect: 'aspect-square',
    color: 'pink',
    title: 'زوايا انعكاس الكريستال',
    subtitle: 'تصميم مريح لقبضة اليد'
  },
  {
    id: 'collage-18',
    src: '/src/assets/images/smooziee_glove_purple_1782955081644.jpg',
    aspect: 'aspect-[3/4]',
    color: 'purple',
    title: 'إصدار الأرجوان المخملي',
    subtitle: 'فخامة مطلقة واهتمام بالتفاصيل'
  },
  {
    id: 'collage-19',
    src: '/src/assets/images/smooziee_black_silk_1782954504154.jpg',
    aspect: 'aspect-square',
    color: 'black',
    title: 'روعة اللون الأسود الداكن',
    subtitle: 'انعكاسات حريرية لافتة للنظر'
  },
  {
    id: 'collage-20',
    src: '/src/assets/images/smooziee_flatlay_pink_1782955093785.jpg',
    aspect: 'aspect-[3/4]',
    color: 'pink',
    title: 'توليفة من الرقة والجمال',
    subtitle: 'عناية كاملة بشعركِ وتدليل يومي'
  }
];

export default function PhotoGrid({ selectedColor }: PhotoGridProps) {
  
  const getItemOpacity = (itemColor: 'pink' | 'purple' | 'black' | 'any') => {
    if (selectedColor === 'any' || itemColor === 'any') return 1;
    return selectedColor === itemColor ? 1 : 0.35;
  };

  const getItemScale = (itemColor: 'pink' | 'purple' | 'black' | 'any') => {
    if (selectedColor === 'any' || itemColor === 'any') return 1;
    return selectedColor === itemColor ? 1.02 : 0.98;
  };

  return (
    <section className="bg-white py-16 px-3 sm:px-6 lg:px-8 border-t-4 border-white" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Gallery Intro with Editorial Luxury aesthetic */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ee6c73]/10 text-[#ee6c73] text-xs font-bold uppercase tracking-widest">
            <Camera size={14} />
            ستوديو التصوير المباشر لسموزيس
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            لوحة إلهام وجمال تفيض بالفخامة
          </h3>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            لقطات حقيقية وحية ومباشرة لفرشاة شعر سموزيس الفاخرة تحت أشعة الشمس الدافئة، وعلب الهدايا المبطنة بالساتان الفاخر.
          </p>
          
          {selectedColor !== 'any' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ee6c73] bg-[#ee6c73]/5 px-3.5 py-1.5 rounded-full border border-[#ee6c73]/20"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>لقد قمنا بتسليط الضوء الفوري على صور اللون المفضل لديكِ!</span>
            </motion.div>
          )}
        </div>

        {/* 
          DENSE HIGH-FASHION MASONRY COLLAGE 
          This layout uses CSS Columns for an organic, Pinterest/editorial-like flow, 
          mirroring the exact tight gap spacing and irregular column layout of the screenshot
        */}
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
          {COLLAGE_ITEMS.map((item) => {
            const isHighlighted = selectedColor === 'any' || item.color === 'any' || selectedColor === item.color;
            
            return (
              <motion.div
                key={item.id}
                id={item.id}
                style={{
                  opacity: getItemOpacity(item.color),
                }}
                animate={{
                  opacity: getItemOpacity(item.color),
                  scale: getItemScale(item.color)
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group shadow-md border-2 border-white bg-gray-50 hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className={`${item.aspect} w-full overflow-hidden relative`}>
                  <img
                    src={item.src}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Glassmorphic Minimalist Label on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                    <span className="text-[9px] font-bold text-[#ee6c73] uppercase tracking-wider mb-0.5">
                      {item.subtitle}
                    </span>
                    <h4 className="text-sm font-extrabold mb-1 flex items-center justify-between">
                      {item.title}
                      <ZoomIn size={14} className="opacity-75" />
                    </h4>
                    
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-white/80">
                        <Heart size={10} className="text-[#ee6c73] fill-[#ee6c73]" />
                        تصميم أصلي
                      </span>
                      
                      {item.color === selectedColor && selectedColor !== 'any' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] bg-[#ee6c73] text-white font-bold px-1.5 py-0.5 rounded-full">
                          <Check size={8} className="stroke-[3]" />
                          مفضل
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Constant visible indicator for highlighted favorite selection */}
                {item.color === selectedColor && selectedColor !== 'any' && (
                  <div className="absolute top-2 right-2 bg-[#ee6c73] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Check size={8} className="stroke-[3]" />
                    <span>لونكِ المختار</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Brand Promise Section below collage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center bg-[#ee6c73]/5 rounded-[32px] p-8 border border-[#ee6c73]/10">
          <div className="p-4">
            <span className="text-3xl mb-2 block">✨</span>
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">ألياف الحرير والنايلون</h5>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">مزيج ثوري يوزع زيوت فروة الرأس الطبيعية بالتساوي ويمنع التطاير.</p>
          </div>
          <div className="p-4 border-y md:border-y-0 md:border-x border-gray-200">
            <span className="text-3xl mb-2 block">💆‍♀️</span>
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">تنشيط الدورة الدموية</h5>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">أسنان الفرشاة المرنة تقوم بتدليك فروة رأسك بلطف لتحفيز نمو صحي وقوي.</p>
          </div>
          <div className="p-4">
            <span className="text-3xl mb-2 block">🎁</span>
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">أولوية الدفعة الأولى</h5>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">حجزكِ يضمن لكِ الفرشاة الفاخرة مع صندوق الهدايا وبخصم خاص قبل الجميع.</p>
          </div>
        </div>

      </div>
    </section>
  );
}

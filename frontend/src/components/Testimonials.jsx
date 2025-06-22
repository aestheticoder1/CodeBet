import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const testimonials = [
    {
        name: "Moksh",
        quote: "CodeBet gave me the same rush as Codeforces contests — but with friends!",
        img: "https://i.pinimg.com/736x/e0/13/90/e01390989877c662bdc1e5e968fd3991.jpg",
    },
    {
        name: "Nihal",
        quote: "The pressure of live duels helped me solve faster and smarter. Highly addictive.",
        img: "https://i.pinimg.com/736x/cc/42/2c/cc422c8aaafc6b9bb9c61237f177d208.jpg",
    },
    {
        name: "Ayush",
        quote: "Absolutely loved the real-time timer and verdict system. Feels like a code arena!",
        img: "https://i.pinimg.com/736x/39/f0/40/39f0400292dafbecf30851e474179350.jpg",
    },
    {
        name: "Aditya",
        quote: "This is not just practice. It’s performance under pressure. Loved every match.",
        img: "https://i.pinimg.com/736x/b8/e4/33/b8e433eea92faca21e7bc49ea1314912.jpg",
    },
    {
        name: "Kavya",
        quote: "CodeBet helped me prepare for contests in a fun, challenging way. No more boring practice.",
        img: "https://i.pinimg.com/736x/e3/4f/2d/e34f2db60b9c80cb14d195c61dc2d642.jpg",
    },
    {
        name: "Tahmis",
        quote: "I was skeptical at first, but 1v1 battles pushed me like no tutorial ever could.",
        img: "https://i.pinimg.com/736x/0c/73/81/0c7381ebbf37f1eb8faac12a08c1f65e.jpg",
    },
];

export default function TestimonialCarousel() {
    return (
        <section className="bg-backgroundDark text-white py-16 px-6 mt-6 mb-28">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-5xl font-bold mb-4 text-primary">Loved by Coders Like You❤️</h2>
                <p className="text-gray-400 text-xl">Real feedback from real warriors.</p>

                <Swiper
                    modules={[Navigation]}
                    navigation
                    grabCursor={true}
                    loop={true}
                    spaceBetween={30}
                    slidesPerGroup={1}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    className="min-h-[400px]"
                >
                    {testimonials.map((t, index) => (
                        <SwiperSlide key={index}>
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="bg-card w-full max-w-[90%] mx-auto rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition hover:shadow-gray-600">
                                    <p className="text-gray-300 italic mb-4 text-lg">“{t.quote}”</p>
                                    <img
                                        src={t.img}
                                        alt={t.name}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400 mb-4"
                                    />
                                    <h4 className="text-yellow-400 font-bold text-lg">— {t.name}</h4>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}

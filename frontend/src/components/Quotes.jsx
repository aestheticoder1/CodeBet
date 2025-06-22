export default function Quote() {
  return (
    <section className="bg-gray text-white py-8 my-32">
      <div className="max-w-7xl mx-auto px-8 text-left">
        <p className="italic text-3xl mb-4 ">
          “You shouldn't care about ratings or rewards — focus on improvement.
          Time-bound challenges bring pressure, deadlines, and failure —
          the exact ingredients that help you get better.”
        </p>
        <h4 className="text-yellow-400 font-semibold text-lg text-right mb-1">
          — Errichto (Erik Rozier)
        </h4>
        <p className="text-sm text-gray-400 mb-1 text-right">
          Codeforces: <span className="text-green-400 font-semibold">International Grandmaster (Rating ~2900+)</span>
        </p>
        <p className="text-sm text-gray-400 text-right">
          CodeChef: <span className="text-green-400 font-semibold">7★ Coder (Rating ~2800+)</span>
        </p>
      </div>
    </section>
  );
}

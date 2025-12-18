export function runDemandEngine(items) {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12

  const seasonalSignals = [
    {
      id: "winter_outerwear",
      title: "Winter Outerwear",
      categories: ["Coats", "Jackets", "Puffer", "Outerwear"],
      start: 11,
      end: 2,
      why: "Cold weather increases demand for warmth",
    },
    {
      id: "christmas_gifts",
      title: "Christmas Gift Items",
      categories: ["Sneakers", "Hoodies", "Accessories"],
      start: 11,
      end: 12,
      why: "Seasonal gifting spike",
    },
    {
      id: "new_year_fitness",
      title: "New Year Fitness",
      categories: ["Trainers", "Sportswear"],
      start: 12,
      end: 2,
      why: "New Year resolutions",
    },
    {
      id: "spring_transition",
      title: "Spring Transition Wear",
      categories: ["Light Jackets", "Sweatshirts"],
      start: 2,
      end: 4,
      why: "Seasonal wardrobe shift",
    },
  ];

  function isRelevant(start, end) {
    if (start <= end) {
      return month >= start && month <= end;
    }
    // year-wrap (e.g. Nov–Feb)
    return month >= start || month <= end;
  }

  return seasonalSignals
    .filter(s => isRelevant(s.start, s.end))
    .map(s => {
      const matches = items.filter(i =>
        s.categories.some(c =>
          (i.finalCategory || "").toLowerCase().includes(c.toLowerCase())
        )
      );

      return {
        id: s.id,
        title: s.title,
        why: s.why,
        window: `${s.start}–${s.end}`,
        inventoryMatch: matches.length,
        demandScore: Math.min(95, 40 + matches.length * 15),
      };
    })
    .sort((a, b) => b.demandScore - a.demandScore);
}

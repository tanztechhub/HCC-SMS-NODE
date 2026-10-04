// ONE-TIME SEED SCRIPT
//
// Creates the Curriculum document (sections + items) for each course listed
// in CURRICULA below, straight through the same Curriculum model the
// Curriculum tab / routes/curriculum.js use - so every section and item gets
// a real, unique Mongo ObjectId exactly like clicking "Add Section"/"Add
// Item" in the UI would produce.
//
// Matching a curriculum entry to a course:
//   1. Exact match (case-insensitive) against Course.name
//   2. Otherwise, a contains-match either direction (handles the DB storing
//      a shorter name, e.g. Course.name "Barista" for the PDF title
//      "Professional Barista Course")
//   3. If that's ambiguous (matches more than one course) or finds nothing,
//      the entry is skipped and reported - fix the `courseName` field below
//      to match your real Course.name and re-run.
//
// Safe to re-run: a course that already has a Curriculum document is
// skipped, never overwritten.
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/seedCurriculum.js
//
// Delete this file once you've verified the Curriculum tab shows everything
// correctly.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

const CURRICULA = [
  {
    courseName: "Professional Barista Course",
    sections: [
      { title: "Introduction. Barista Programme", items: ["Introduction & Career Mapping", "Orientation"] },
      { title: "1. Introduction to Coffee", items: ["Coffee History", "Distribution", "Coffee Leaves", "Coffee Species", "Characters of Species", "Bean Belt"] },
      { title: "2. Coffee Processing Method", items: ["Wet Method", "Natural Method", "Honey Method", "Decaf Method"] },
      { title: "3. Fermentation Method", items: ["Traditional", "Anaerobic", "Carbonic Maceration"] },
      { title: "4. Kenyan Coffee History", items: ["Characteristics"] },
      { title: "5. Coffee Tasting (Sensory)", items: ["How to Taste", "Barista Calibration", "Taste Manipulation (Filter & Espresso)", "Basic Taste", "Flavours & Aroma"] },
      { title: "6. Coffee Roasting", items: ["How to Roast", "Roasting Process", "Roasting Stages", "Roasting Types", "Storage"] },
      { title: "Introduction to Espresso Machine", items: ["Types of Machine", "Counter Set-up", "Types of Grinder", "Parts of Espresso Machine", "Parts of Coffee Grinder"] },
      { title: "7. Hygiene & Station Management", items: ["How to Clean Espresso Machine", "How to Clean Grinder", "Station Manning"] },
      { title: "8. E.B.F (Espresso Brewing Formula)", items: ["Introduction to Extraction", "E.B.F Ratios", "Similarities & Differentiation", "Grinder Adjustment", "Calibration", "Quality Check (Doubling In)"] },
      { title: "9. Standards for Brewing", items: ["Introduction to Tasting Standards"] },
      { title: "10. Coffee Beverages (Hot)", items: ["Classic Espresso", "Extractions", "Steaming Practicals", "Latte Art (Intro)", "Beverage Dispense", "Multitasking, Hygiene, Concentration", "Presentation & Speed"] },
      { title: "11. Filter Coffee", items: ["Introduction to Filter", "Brewing Methods", "Brewing Steps", "Standards", "Brewing Fundamentals", "How to Brew", "Revision: How to Brew", "Presentation", "Multi Brewing", "Coffee Brew Chart / Ratio", "How to Taste"] },
      { title: "12. Beverage Topic", items: ["Introduction to Menu", "Cold Beverages", "Iced Beverages", "Blended Beverages", "Mocktails", "Lemonades", "Iced Tea", "Iced Coffee", "Smoothies", "Milkshakes & Smoothies", "Signature", "Boba"] },
      { title: "13. Tea Topic (Hot)", items: ["Introduction to Tea", "Tea Production", "Tea Beverages"] },
      { title: "14. Latte Art", items: ["Milk Texture", "Extraction", "Pouring Techniques", "Latte Art Designs", "Temperature", "Chill & Chin Foam"] },
      { title: "15. Classic Coffees", items: ["Introduction to Classic Coffee", "How to Dispense", "Standards", "Presentation", "Speed / Multitasking / Concentration", "Team / Group Work", "Individual Dispense (1st – 3, 2nd – 4, 3rd – 5)", "Extraction Beverages"] },
      { title: "16. Espresso Bar", items: ["Introduction to Espresso Bar", "Types of Machine", "Counter Set-up", "Standards", "Station Manning", "Introduction to Steaming", "Innovation", "New Brewing Equipment"] },
      { title: "17. Service (Beverage Service)", items: ["Introduction to Service", "Service Protocols", "P.O.S", "Menu Presentation", "Order Taking", "Service Practical", "Team Work"] },
      { title: "18. Finance Topic", items: ["Stock and Inventory", "Daily Stock Sheet", "Cashier Report", "Costing", "Budgeting", "Investment Ideas"] },
      { title: "19. Customer Service", items: ["Principles", "Skills in Customer Service", "Ambience", "Personal Branding", "Career Growth", "Service (Beverage)", "Personal Introduction", "CV Writing", "Interview Wear", "Management", "Leadership"] },
      { title: "20. Career Coaching", items: ["Career Growth", "CV Writing", "Interview", "Job Application", "Video Recording", "Industry Insights", "Networking"] },
      { title: "21. Freelance Practices", items: ["Filter Brewing", "Espresso Drinks"] },
    ],
  },
  {
    courseName: "Sensory Course",
    sections: [
      { title: "1. Aroma Identification", items: ["Theory", "Practical"] },
      { title: "2. Flavor Perception", items: ["Taste Attributes", "Flavor Profiling", "Flavor Complex"] },
      { title: "3. Defect Recognition", items: ["Common Defects", "Taint Defects", "Fault Defects"] },
      { title: "4. Cupping Techniques", items: ["Professional Cupping Session", "Cupping Set Up", "Cupping Protocols", "Cupping Standards", "CVA Cupping Forms"] },
      { title: "5. Sensory Evaluation", items: ["Principles of Sensory", "Evaluation Senses", "CVA (Coffee Value Addition)", "CVA Cupping Score"] },
    ],
  },
  {
    // Every section here has no listed sub-items in the source document -
    // that's intentional and fully supported (see items: []).
    courseName: "Green Coffee Course",
    sections: [
      { title: "1. Introduction to Coffee", items: [] },
      { title: "2. Coffee Processing Methods", items: [] },
      { title: "3. Fermentation Methods", items: [] },
      { title: "4. Hybrid Fermentation", items: [] },
      { title: "5. Coffee Drying & Milling", items: [] },
      { title: "6. Green Coffee Assessment", items: [] },
      { title: "7. Coffee Buying & Logistics", items: [] },
    ],
  },
  {
    // Same as above - flat list of topics, no sub-items in the source doc.
    courseName: "Professional Roasting Course",
    sections: [
      { title: "1. Introduction to Coffee", items: [] },
      { title: "2. Coffee Roasting", items: [] },
      { title: "3. Sensory Evaluation", items: [] },
      { title: "4. Roasting Softwares", items: [] },
      { title: "5. Roastery Management", items: [] },
      { title: "6. Hygiene & Maintenance", items: [] },
      { title: "7. Stock, Inventory & Costing", items: [] },
      { title: "8. Packaging & Branding", items: [] },
      { title: "9. Sales & Marketing", items: [] },
      { title: "10. Buying & Logistics", items: [] },
    ],
  },
  {
    courseName: "Wine Course",
    sections: [
      {
        title: "Level 1 – Wine Fundamentals",
        items: [
          "Introduction to Wine", "Grape Varieties & Wine Styles", "Wine Making Process",
          "Wine Regions of the World", "Wine Tasting Techniques", "Food & Wine Pairing Basics",
          "Wine Service & Presentation", "Wine Storage & Handling", "Practical Tasting Sessions",
        ],
      },
      {
        title: "Level 2 – Wine Appreciation & Advanced Knowledge",
        items: [
          "Advanced Grape Varieties & Styles", "Old World vs New World Wines", "Viticulture & Terroir",
          "Advanced Wine Tasting & Evaluation", "Sparkling, Fortified & Dessert Wines",
          "Wine & Food Pairing (Advanced)", "Wine Business & Marketing Basics", "Building a Wine List",
          "Practical Tasting & Final Assessment",
        ],
      },
    ],
  },
  {
    // Source document only has one top-level header covering every item.
    courseName: "Mixology Course",
    sections: [
      {
        title: "Cocktail History",
        items: [
          "Alcohol Fermentation", "Spirit Production", "Bar Management", "Bar Tools & Glasses",
          "Creating Cocktails (Methods)", "Crafting Mocktails", "Crafting Cocktails", "Art of Garnishing",
          "Solids", "Bitters", "Vodka, Gin, Rum Cocktails", "Tequila, Brandy Cocktails",
          "Whisky & Wine Cocktails", "Shooter Cocktails", "Whisky Theory",
          "Liqueurs, Aperitifs, Spritz, Beer", "Wine Theory & Service", "Signature Drinks",
          "Costing, Inventory & Budget", "Customer Service",
        ],
      },
    ],
  },
];

const normalize = (str) => str.trim().toLowerCase();

const findMatchingCourse = (courses, courseName) => {
  const target = normalize(courseName);

  const exact = courses.find((c) => normalize(c.name) === target);
  if (exact) return { course: exact, matchType: "exact" };

  const containsMatches = courses.filter((c) => {
    const name = normalize(c.name);
    return target.includes(name) || name.includes(target);
  });

  if (containsMatches.length === 1) {
    return { course: containsMatches[0], matchType: "fuzzy" };
  }
  if (containsMatches.length > 1) {
    return { course: null, matchType: "ambiguous", candidates: containsMatches };
  }
  return { course: null, matchType: "none" };
};

async function seedCurriculum() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const Course = require('../models/courses');
  const Curriculum = require('../models/curriculum');

  const courses = await Course.find();
  console.log(`\n📚 Found ${courses.length} course(s) in the database:`);
  courses.forEach((c) => console.log(`   - ${c.name}`));

  const created = [];
  const skippedExisting = [];
  const unmatched = [];

  for (const entry of CURRICULA) {
    const { course, matchType, candidates } = findMatchingCourse(courses, entry.courseName);

    if (!course) {
      unmatched.push({ ...entry, matchType, candidates });
      continue;
    }

    const existing = await Curriculum.findOne({ courseId: course._id });
    if (existing) {
      skippedExisting.push({ courseName: course.name, matchedFrom: entry.courseName });
      continue;
    }

    await Curriculum.create({
      courseId: course._id,
      sections: entry.sections.map((section) => ({
        title: section.title,
        items: section.items.map((title) => ({ title })),
      })),
    });

    created.push({ courseName: course.name, matchedFrom: entry.courseName, matchType, sectionCount: entry.sections.length });
  }

  console.log('\n============================================================');
  console.log('📋 CURRICULUM SEED SUMMARY');
  console.log('============================================================');

  console.log(`\n✅ Created (${created.length}):`);
  created.forEach((c) =>
    console.log(`   - "${c.matchedFrom}" → Course "${c.courseName}" (${c.matchType} match, ${c.sectionCount} sections)`)
  );

  console.log(`\n⏭️  Skipped - already had a curriculum (${skippedExisting.length}):`);
  skippedExisting.forEach((c) => console.log(`   - "${c.matchedFrom}" → Course "${c.courseName}"`));

  console.log(`\n❌ Could not match to a course (${unmatched.length}):`);
  unmatched.forEach((u) => {
    if (u.matchType === "ambiguous") {
      console.log(`   - "${u.courseName}" matched multiple courses: ${u.candidates.map((c) => c.name).join(", ")}`);
    } else {
      console.log(`   - "${u.courseName}" - no matching course found. Fix courseName in this script and re-run.`);
    }
  });

  console.log('\n============================================================');
  console.log(unmatched.length === 0 ? '🎉 All curricula matched and processed!' : '⚠️  Some curricula need manual attention (see above).');
  console.log('============================================================');

  process.exit(0);
}

seedCurriculum().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});

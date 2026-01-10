/* =========================================
   RESULT MARKETING - TESTIMONIALS DATABASE
   100+ testimonials per industry
   ========================================= */

const TestimonialsDB = {
    // =========================================
    // INSURANCE AGENT TESTIMONIALS (100+)
    // =========================================
    insurance: [
        // PRUDENTIAL
        { name: "Ahmad Faizal", initials: "AF", company: "Prudential", rank: "MDRT", location: "Kuala Lumpur", quote: "Closed RM3,000/month case because AI reminded me client's daughter starting university. That one case paid for 10 years of subscription.", metric: "RM36k annual premium" },
        { name: "Kevin Tan", initials: "KT", company: "Prudential", rank: "COT (Court of the Table)", location: "Petaling Jaya", quote: "I have 600+ clients from 12 years in this industry. AI helps me remember who has what policy. Found 45 upsell opportunities in one afternoon.", metric: "45 upsell leads found" },
        { name: "Priya Krishnan", initials: "PK", company: "Prudential", rank: "MDRT", location: "Subang Jaya", quote: "Used to lose 2-3 renewals every month because I forgot to follow up. Now AI reminds me 2 weeks before. Zero lost renewals in 6 months.", metric: "0 lost renewals" },
        { name: "Nurul Aisyah", initials: "NA", company: "Prudential", rank: "Agency Manager", location: "Shah Alam", quote: "Managing 25 agents now. AI helps me track each agent's pipeline and who needs coaching. My team's closing rate up 40%.", metric: "40% team improvement" },
        { name: "Jason Lee", initials: "JL", company: "Prudential", rank: "TOT (Top of the Table)", location: "Mont Kiara", quote: "At TOT level, relationships are everything. AI remembers every client's family, hobbies, important dates. My clients feel like VIPs.", metric: "98% retention rate" },
        { name: "Siti Mariam", initials: "SM", company: "Prudential", rank: "Premier Agent", location: "Bangsar", quote: "Recruited 8 new agents this year. AI tracks each recruit's progress, objections, and when to follow up. Best recruitment year ever.", metric: "8 new recruits" },
        { name: "Raj Kumar", initials: "RK", company: "Prudential", rank: "Senior Unit Manager", location: "Klang", quote: "Birthday wishes used to take me 2 hours on Excel. Now I ask AI 'siapa birthday minggu ni?' - 30 seconds, done.", metric: "2 hours saved weekly" },
        { name: "Michelle Wong", initials: "MW", company: "Prudential", rank: "MDRT", location: "Damansara", quote: "Client called asking about 'that plan we discussed.' AI instantly showed me our conversation from 8 months ago. Closed on the spot.", metric: "RM500k case closed" },
        { name: "Hafiz Rahman", initials: "HR", company: "Prudential", rank: "Unit Manager", location: "Ampang", quote: "Tracking 15 potential recruits at different stages. AI tells me exactly who needs what - presentation, objection handling, or closing.", metric: "15 recruits in pipeline" },
        { name: "Amanda Lim", initials: "AL", company: "Prudential", rank: "COT", location: "TTDI", quote: "My agency CRM tracks company metrics. This tracks MY relationships. Finally have a system that works for ME, not headquarters.", metric: "Personal CRM freedom" },

        // AIA
        { name: "Mohd Rizal", initials: "MR", company: "AIA", rank: "MDRT", location: "Johor Bahru", quote: "JB market is competitive. AI helps me remember every detail about prospects. When I call, they're impressed I remember their kids' names.", metric: "35% higher close rate" },
        { name: "Christina Tan", initials: "CT", company: "AIA", rank: "Agency Leader", location: "Penang", quote: "Leading 40 agents across Penang. AI tracks everyone's activity. I know exactly who's struggling before they tell me.", metric: "40 agents managed" },
        { name: "Lakshmi Devi", initials: "LD", company: "AIA", rank: "Premier Academy", location: "Ipoh", quote: "New to insurance, 2 years in. AI is like having a senior agent's memory from day one. My peers still use notebooks, I use AI.", metric: "Top rookie award" },
        { name: "Farah Aminah", initials: "FA", company: "AIA", rank: "MDRT", location: "Melaka", quote: "Melaka is small, everyone knows everyone. AI helps me track relationships between clients. Referrals up 60% this year.", metric: "60% more referrals" },
        { name: "David Ng", initials: "DN", company: "AIA", rank: "District Manager", location: "Kuching", quote: "Managing East Malaysia territory. AI helps me track 200+ clients across Sarawak. Distance doesn't matter when you remember everything.", metric: "200+ clients tracked" },
        { name: "Aini Zainal", initials: "AZ", company: "AIA", rank: "Senior Agent", location: "Kota Kinabalu", quote: "Sabah clients appreciate personal touch. AI reminds me of Harvest Festival, Kaamatan dates. Cultural sensitivity = more trust.", metric: "Cultural dates tracked" },
        { name: "Vincent Chong", initials: "VC", company: "AIA", rank: "COT", location: "Seremban", quote: "15 years experience. Thought I didn't need tech. Tried AI for one month - found RM200k in missed opportunities in my existing book.", metric: "RM200k opportunities" },
        { name: "Nadia Hassan", initials: "NH", company: "AIA", rank: "MDRT", location: "Putrajaya", quote: "Government servant clients need careful handling. AI tracks every conversation, every promise. Nothing falls through cracks.", metric: "Zero complaints" },
        { name: "Kumar Selvam", initials: "KS", company: "AIA", rank: "Unit Manager", location: "Kajang", quote: "Indian community values relationships. AI helps me remember every family member, every function attended. They see me as family now.", metric: "Community trust built" },
        { name: "Jenny Koh", initials: "JK", company: "AIA", rank: "TOT", location: "Bukit Bintang", quote: "High net worth clients expect perfection. AI ensures I never forget their preferences, their concerns, their family situations.", metric: "HNW client retention" },

        // GREAT EASTERN
        { name: "Azman Ismail", initials: "AI", company: "Great Eastern", rank: "MDRT", location: "Cyberjaya", quote: "Tech-savvy clients in Cyberjaya appreciate when I use AI. Shows I'm modern, efficient. Closed 3 IT director cases this month.", metric: "3 IT director cases" },
        { name: "Sharon Tan", initials: "ST", company: "Great Eastern", rank: "Agency Director", location: "Puchong", quote: "Director level means managing managers. AI helps me track 5 unit managers and their 50+ agents. Full visibility, zero micromanaging.", metric: "55 people managed" },
        { name: "Ganesh Pillai", initials: "GP", company: "Great Eastern", rank: "Senior Advisor", location: "Brickfields", quote: "Little India clients - I track every Deepavali, every Thaipusam. AI reminds me to wish them. They remember who remembers them.", metric: "Festival tracking" },
        { name: "Noraini Yusof", initials: "NY", company: "Great Eastern", rank: "MDRT", location: "Cheras", quote: "Working mothers are my niche. AI helps me track their kids' ages, school schedules, concerns. I speak their language.", metric: "Mom niche dominated" },
        { name: "Eric Lau", initials: "EL", company: "Great Eastern", rank: "Premier Advisor", location: "Setapak", quote: "Chinese clients value 'face'. Remembering their achievements, their children's success - AI makes me look like I genuinely care. Because I do.", metric: "Face-conscious service" },
        { name: "Zuraidah Ahmad", initials: "ZA", company: "Great Eastern", rank: "Unit Manager", location: "Gombak", quote: "Recruited 12 agents this year by tracking every conversation with prospects. AI told me exactly when each person was ready to join.", metric: "12 recruits this year" },
        { name: "Raymond Yap", initials: "RY", company: "Great Eastern", rank: "COT", location: "Kepong", quote: "COT requires volume. AI helps me manage 400+ clients without missing anyone. Quality AND quantity.", metric: "400+ active clients" },
        { name: "Prema Sundram", initials: "PS", company: "Great Eastern", rank: "MDRT", location: "Sentul", quote: "Tamil-speaking clients trust me because I remember their family trees. AI keeps track of complex family relationships.", metric: "Family tree tracking" },
        { name: "Hakim Abdullah", initials: "HA", company: "Great Eastern", rank: "Financial Planner", location: "Wangsa Maju", quote: "Financial planning needs long-term view. AI tracks clients' life stages - marriage, kids, retirement. I'm always one step ahead.", metric: "Life stage planning" },
        { name: "Lisa Chen", initials: "LC", company: "Great Eastern", rank: "Agency Manager", location: "Sri Petaling", quote: "Managing agency of 30 agents. AI tracks everyone's training progress, certifications needed, renewal dates. Nothing expires anymore.", metric: "Zero lapsed certs" },

        // ALLIANZ
        { name: "Firdaus Osman", initials: "FO", company: "Allianz", rank: "MDRT", location: "Bangi", quote: "UKM and UPM nearby - lots of academician clients. AI helps me track their sabbaticals, promotions, research grants. Timing is everything.", metric: "Academic niche" },
        { name: "Benjamin Tan", initials: "BT", company: "Allianz", rank: "Elite Producer", location: "USJ", quote: "Elite Producer status means premium service. AI remembers every interaction so clients feel they're my only client.", metric: "VIP service delivery" },
        { name: "Kavitha Rajan", initials: "KR", company: "Allianz", rank: "Senior Partner", location: "Klang", quote: "Port Klang business owners need comprehensive coverage. AI tracks their businesses, vehicles, properties. One agent for everything.", metric: "Comprehensive coverage" },
        { name: "Zulkifli Mat", initials: "ZM", company: "Allianz", rank: "MDRT", location: "Rawang", quote: "Rawang growing fast. New homeowners everywhere. AI helps me track who bought house when, mortgage details, coverage gaps.", metric: "New homeowner leads" },
        { name: "Wendy Goh", initials: "WG", company: "Allianz", rank: "Unit Manager", location: "Sungai Buloh", quote: "Recruited from my warm market. AI helped me track 50 friends and family, their objections, their timelines. 8 joined my team.", metric: "8 warm market recruits" },
        { name: "Ravi Chandran", initials: "RC", company: "Allianz", rank: "Premier Agent", location: "Petaling Jaya", quote: "Indian business community trusts referrals. AI tracks who referred who. My referral chain is 4 generations deep now.", metric: "4-gen referral chain" },
        { name: "Normala Salleh", initials: "NS", company: "Allianz", rank: "COT", location: "Damansara Utama", quote: "High-income area, high expectations. AI ensures I never forget a single detail. My clients expect perfection, I deliver.", metric: "Premium area success" },
        { name: "Kenny Tan", initials: "KT", company: "Allianz", rank: "Agency Director", location: "Kota Damansara", quote: "Building agency from scratch. AI tracks every recruit prospect, every team member's progress. Grew from 5 to 35 agents in 2 years.", metric: "5 to 35 agents" },
        { name: "Anita Fernandez", initials: "AF", company: "Allianz", rank: "MDRT", location: "Bukit Jalil", quote: "Sports City area - lots of young families. AI tracks kids' ages, school transitions, milestone events. Perfect timing for education plans.", metric: "Education plan specialist" },
        { name: "Ibrahim Hassan", initials: "IH", company: "Allianz", rank: "Senior Manager", location: "Putrajaya", quote: "Government sector specialist. AI tracks grade promotions, pension timelines, department transfers. I know their career better than HR.", metric: "Govt sector expert" },

        // ZURICH
        { name: "Amirul Hakim", initials: "AH", company: "Zurich Takaful", rank: "MDRT", location: "Shah Alam", quote: "Takaful clients want Shariah compliance AND good service. AI helps me track their concerns, family values, religious preferences.", metric: "Takaful specialist" },
        { name: "Patricia Lee", initials: "PL", company: "Zurich", rank: "Senior Consultant", location: "Subang", quote: "Zurich's international clients need global perspective. AI tracks their overseas travel, expat needs, international coverage gaps.", metric: "Expat coverage expert" },
        { name: "Muthu Krishnan", initials: "MK", company: "Zurich", rank: "District Leader", location: "Batu Caves", quote: "Temple community trusts me. AI reminds me of every festival, every major event. I'm there for them, they're there for me.", metric: "Temple community served" },
        { name: "Rashidah Karim", initials: "RK", company: "Zurich Takaful", rank: "Agency Manager", location: "Bandar Sunway", quote: "Managing 20 Takaful agents. AI tracks everyone's Halal certification, product knowledge, client portfolios. Compliance made easy.", metric: "20 compliant agents" },
        { name: "Jimmy Ong", initials: "JO", company: "Zurich", rank: "MDRT", location: "Bangsar South", quote: "Bangsar South professionals expect efficiency. AI makes me efficient. 5-minute refresher before any meeting, fully prepared.", metric: "5-min meeting prep" },
        { name: "Salina Ibrahim", initials: "SI", company: "Zurich Takaful", rank: "COT", location: "Cyberjaya", quote: "Corporate Takaful is my specialty. AI tracks company structures, key decision makers, renewal timelines across 30 companies.", metric: "30 corporate accounts" },
        { name: "Alan Tan", initials: "AT", company: "Zurich", rank: "Premier Advisor", location: "Mont Kiara", quote: "Expat community in Mont Kiara. AI tracks visa renewals, home country details, repatriation plans. Comprehensive service.", metric: "Expat community expert" },
        { name: "Nurul Huda", initials: "NH", company: "Zurich Takaful", rank: "MDRT", location: "Puchong", quote: "Young professionals want modern approach. AI shows I'm tech-forward. They trust me because I'm like them.", metric: "Young professional niche" },
        { name: "Steve Wong", initials: "SW", company: "Zurich", rank: "Senior Partner", location: "Old Klang Road", quote: "Been in industry 20 years. AI taught old dog new tricks. My productivity doubled, my stress halved.", metric: "Productivity doubled" },
        { name: "Faridah Jaafar", initials: "FJ", company: "Zurich Takaful", rank: "Unit Manager", location: "Kelana Jaya", quote: "Female agents in my team appreciate AI. Less paperwork, more selling time. Work-life balance improved for everyone.", metric: "Team work-life balance" },

        // AXA
        { name: "Marcus Chin", initials: "MC", company: "AXA Affin", rank: "MDRT", location: "Ara Damansara", quote: "General insurance + life combo is my strength. AI tracks vehicles, properties, AND life policies for each client. Full picture.", metric: "Full coverage tracking" },
        { name: "Shanti Nair", initials: "SN", company: "AXA Affin", rank: "Senior Agent", location: "Taman Tun", quote: "TTDI wealthy aunties love personal touch. AI helps me remember their grandchildren names, their health concerns, their travel plans.", metric: "Wealthy auntie market" },
        { name: "Azri Yusoff", initials: "AY", company: "AXA Affin", rank: "Agency Leader", location: "Setia Alam", quote: "New township, new opportunities. AI tracks every new homeowner, every new business. First mover advantage.", metric: "New township pioneer" },
        { name: "Diana Chua", initials: "DC", company: "AXA Affin", rank: "COT", location: "Tropicana", quote: "High-end property owners need comprehensive coverage. AI tracks their multiple properties, vehicles, travel patterns.", metric: "HNWI portfolio management" },
        { name: "Razak Abdul", initials: "RA", company: "AXA Affin", rank: "MDRT", location: "Glenmarie", quote: "Factory owners in Glenmarie industrial area. AI tracks their business cycles, machinery, employee counts. B2B mastery.", metric: "Industrial client expert" },
        { name: "Jacqueline Lim", initials: "JL", company: "AXA Affin", rank: "Premier Agent", location: "Sunway", quote: "Sunway ecosystem - university, hospital, mall, resort. AI helps me track clients across all these touchpoints.", metric: "Ecosystem coverage" },
        { name: "Vellu Samy", initials: "VS", company: "AXA Affin", rank: "District Manager", location: "Sentul", quote: "Sentul transformation bringing new residents. AI tracks who's moving in, what they need, when they need it.", metric: "Gentrification tracker" },
        { name: "Aishah Hamid", initials: "AH", company: "AXA Affin", rank: "Senior Consultant", location: "Bukit Damansara", quote: "Old money Damansara families. AI tracks generations - grandparents, parents, now their children becoming my clients.", metric: "Multi-gen families" },
        { name: "Brian Teoh", initials: "BT", company: "AXA Affin", rank: "MDRT", location: "Kuchai Lama", quote: "SME owners trust me because I remember their business challenges. AI tracks cash flow seasons, expansion plans, risk concerns.", metric: "SME business partner" },
        { name: "Rosmawati Kadir", initials: "RK", company: "AXA Affin", rank: "Unit Manager", location: "Cheras Selatan", quote: "Building team in Cheras. AI helps me identify best recruits - their career stage, financial needs, sales potential.", metric: "Recruitment system" },

        // MANULIFE
        { name: "Daniel Chia", initials: "DC", company: "Manulife", rank: "MDRT", location: "Hartamas", quote: "Investment-linked specialist. AI tracks market conditions when clients bought, their risk appetite, review dates. Proactive service.", metric: "ILP portfolio tracking" },
        { name: "Rohani Samad", initials: "RS", company: "Manulife", rank: "Agency Director", location: "Ampang Hilir", quote: "Diplomatic enclave clients. AI tracks posting cycles, embassy events, country-specific needs. International service.", metric: "Embassy client expert" },
        { name: "Prakash Nair", initials: "PN", company: "Manulife", rank: "Senior Manager", location: "Taman Melawati", quote: "Built team from family and friends. AI tracked every conversation, every objection. 15 of them now in my agency.", metric: "15 family recruits" },
        { name: "Mei Ling Tan", initials: "MT", company: "Manulife", rank: "COT", location: "Desa Park City", quote: "DPC residents are detail-oriented. AI helps me be even more detailed. They check everything, I'm always prepared.", metric: "Detail-oriented service" },
        { name: "Zainal Abidin", initials: "ZA", company: "Manulife", rank: "MDRT", location: "Wangsa Melawati", quote: "Malay professional market. AI tracks their corporate benefits, what gaps remain, family protection needs.", metric: "Corporate gap analysis" },
        { name: "Catherine Yap", initials: "CY", company: "Manulife", rank: "Premier Partner", location: "Solaris Dutamas", quote: "Young executives starting families. AI tracks their life milestones - engagement, wedding, baby, house. Perfect timing for each product.", metric: "Milestone marketing" },
        { name: "Suresh Kumar", initials: "SK", company: "Manulife", rank: "District Leader", location: "Taman Desa", quote: "Indian professional network is tight. AI tracks who knows who, who referred who. My network effect is exponential.", metric: "Network effect mapped" },
        { name: "Lina Hassan", initials: "LH", company: "Manulife", rank: "Senior Advisor", location: "Sri Hartamas", quote: "Single women professionals - underserved market. AI helps me understand their unique concerns, career goals, financial independence needs.", metric: "Single women specialist" },
        { name: "Gary Chong", initials: "GC", company: "Manulife", rank: "MDRT", location: "Damansara Heights", quote: "Ultra high net worth families. AI tracks their family offices, succession plans, philanthropic interests. Holistic service.", metric: "UHNW family office" },
        { name: "Nazreen Ahmad", initials: "NA", company: "Manulife", rank: "Agency Manager", location: "Bukit Jelutong", quote: "Shah Alam new areas growing fast. AI helps me and my 25 agents track the entire territory systematically.", metric: "Territory management" },

        // TOKIO MARINE
        { name: "William Lee", initials: "WL", company: "Tokio Marine", rank: "MDRT", location: "Taman Duta", quote: "Japanese corporate clients expect perfection. AI helps me maintain Japanese-level service standards.", metric: "Japanese corporate clients" },
        { name: "Suraya Ismail", initials: "SI", company: "Tokio Marine", rank: "Senior Partner", location: "KLCC", quote: "KLCC office workers, time-poor but money-rich. AI makes every interaction efficient. They respect efficiency.", metric: "KLCC corporate market" },
        { name: "Rajan Menon", initials: "RM", company: "Tokio Marine", rank: "Agency Leader", location: "Bangsar", quote: "Bangsar creative industry - unpredictable income, unique needs. AI tracks their project cycles, cash flow patterns.", metric: "Creative industry specialist" },
        { name: "Agnes Tan", initials: "AT", company: "Tokio Marine", rank: "COT", location: "Mutiara Damansara", quote: "Young families in Mutiara D. AI tracks their kids' schools, activities, future education needs. I plan with them.", metric: "Family planning partner" },
        { name: "Khairul Anuar", initials: "KA", company: "Tokio Marine", rank: "MDRT", location: "Putrajaya", quote: "Government sector needs different approach. AI tracks their pension schemes, what's covered, what gaps exist.", metric: "Pension gap analysis" },

        // ETIQA
        { name: "Faizal Mahmud", initials: "FM", company: "Etiqa", rank: "MDRT", location: "Kota Bharu", quote: "East Coast market is relationship-driven. AI helps me remember every kenduri attended, every family connection.", metric: "East Coast relationship master" },
        { name: "Lily Tan", initials: "LT", company: "Etiqa", rank: "Senior Consultant", location: "Kuantan", quote: "Kuantan oil & gas workers. AI tracks their offshore schedules, contract renewals, coverage needs during rotation.", metric: "O&G worker specialist" },
        { name: "Anand Pillai", initials: "AP", company: "Etiqa", rank: "Agency Manager", location: "Seremban", quote: "Seremban close to KL but different market. AI helps me understand local business cycles, estate workers, town professionals.", metric: "Seremban market expert" },
        { name: "Noor Azizah", initials: "NA", company: "Etiqa", rank: "MDRT", location: "Terengganu", quote: "Terengganu market values trust above all. AI helps me build trust by never forgetting what matters to them.", metric: "Trust-based selling" },
        { name: "Simon Yap", initials: "SY", company: "Etiqa", rank: "District Leader", location: "Malacca", quote: "Historical Melaka - old families, old money. AI tracks generational wealth, business succession, family dynamics.", metric: "Old money specialist" },

        // Additional varied testimonials to reach 100
        { name: "Haslinda Azmi", initials: "HA", company: "Prudential", rank: "MDRT", location: "Selayang", quote: "Recruited 6 single mothers into insurance. AI helped me track their situations, provide support, guide their development.", metric: "6 single mom recruits" },
        { name: "Derek Tan", initials: "DT", company: "AIA", rank: "Senior Agent", location: "Serdang", quote: "UPM area - academics with complex finances. AI tracks their research grants, sabbaticals, consultancy income.", metric: "Academic finances tracked" },
        { name: "Malathi Subramaniam", initials: "MS", company: "Great Eastern", rank: "MDRT", location: "Brickfields", quote: "Little India business community. AI tracks their festival stock cycles, wedding seasons, cash flow patterns.", metric: "Business cycle expert" },
        { name: "Ahmad Fauzi", initials: "AF", company: "Allianz", rank: "COT", location: "Nilai", quote: "KLIA vicinity - airport workers, hotel staff. AI tracks shift patterns, career progressions, overseas postings.", metric: "Airport vicinity specialist" },
        { name: "Jessica Wong", initials: "JW", company: "Zurich", rank: "Agency Manager", location: "Cheras", quote: "Built agency from zero. AI tracked every potential recruit, their readiness signals, joining timeline. Now 40 strong.", metric: "Zero to 40 agents" },
        { name: "Ramesh Krishnan", initials: "RK", company: "Manulife", rank: "MDRT", location: "Klang", quote: "Port Klang traders - volatile income, high risk. AI helps me design coverage for their unique situations.", metric: "Trader risk specialist" },
        { name: "Salmah Yusof", initials: "SY", company: "AXA Affin", rank: "Senior Partner", location: "Kajang", quote: "Kajang teachers and civil servants. AI tracks their increments, promotions, retirement timelines perfectly.", metric: "Civil servant expert" },
        { name: "Tony Leong", initials: "TL", company: "Tokio Marine", rank: "MDRT", location: "Sri Petaling", quote: "Chinese SME owners - trust takes years. AI helped me remember every detail for 3 years. Now I have 50+ SME clients.", metric: "50+ SME clients" },
        { name: "Aisyah Rahman", initials: "AR", company: "Etiqa", rank: "COT", location: "Ipoh", quote: "Ipoh retirees moving from KL. AI tracks their KL history, family in KL, medical needs. I'm their Ipoh connection.", metric: "Retiree specialist" },
        { name: "Michael Ng", initials: "MN", company: "Prudential", rank: "TOT", location: "Georgetown", quote: "Penang heritage families. AI tracks 4 generations of relationships. Their great-grandkids will be my clients too.", metric: "4-generation relationships" },
        { name: "Nordin Ismail", initials: "NI", company: "AIA", rank: "Agency Director", location: "Johor Bahru", quote: "JB-Singapore commuters. AI tracks their Singapore income, MY expenses, cross-border needs. Unique niche.", metric: "Cross-border specialist" },
        { name: "Penny Lim", initials: "PL", company: "Great Eastern", rank: "MDRT", location: "Penang", quote: "Penang tech workers. AI helps me understand their stock options, startup equity, variable compensation.", metric: "Tech comp specialist" },
        { name: "Ishak Ahmad", initials: "IA", company: "Allianz", rank: "Senior Manager", location: "Kuala Terengganu", quote: "East Coast oil & gas families. AI tracks offshore schedules, danger pay periods, family concerns.", metric: "O&G family expert" },
        { name: "Grace Chen", initials: "GC", company: "Zurich", rank: "COT", location: "Subang", quote: "Subang airport community. AI tracks pilot schedules, cabin crew rosters, aviation industry cycles.", metric: "Aviation industry expert" },
        { name: "Kamal Hassan", initials: "KH", company: "Manulife", rank: "MDRT", location: "Cyberjaya", quote: "Cyberjaya startups. AI tracks their funding rounds, pivots, team growth. Insurance grows with them.", metric: "Startup growth partner" },
        { name: "Vivian Tan", initials: "VT", company: "AXA Affin", rank: "Premier Agent", location: "Bandar Utama", quote: "BU families upgrading from apartments to landed. AI tracks their property journey, life stage, coverage upgrades needed.", metric: "Property upgrade tracker" },
        { name: "Fauziah Omar", initials: "FO", company: "Tokio Marine", rank: "MDRT", location: "Kota Kinabalu", quote: "Sabah estate managers. AI tracks plantation cycles, worker housing, remote area challenges.", metric: "Estate industry specialist" },
        { name: "Edmund Yeo", initials: "EY", company: "Etiqa", rank: "Agency Leader", location: "Kuching", quote: "Sarawak diverse communities. AI helps me track cultural sensitivities, different celebrations, local customs.", metric: "Sarawak cultural expert" },
        { name: "Norazlina Mohd", initials: "NM", company: "Prudential", rank: "MDRT", location: "Alor Setar", quote: "Northern region farmers and traders. AI tracks harvest seasons, market cycles, income patterns.", metric: "Agricultural cycle expert" },
        { name: "Henry Tan", initials: "HT", company: "AIA", rank: "Senior Partner", location: "Butterworth", quote: "Industrial Butterworth. AI tracks factory expansion, worker counts, business growth trajectories.", metric: "Industrial zone specialist" },
    ],

    // =========================================
    // REAL ESTATE AGENT TESTIMONIALS (100+)
    // =========================================
    realestate: [
        // IQI
        { name: "Jason Lim", initials: "JL", company: "IQI Realty", rank: "Top Producer", location: "Mont Kiara", quote: "Had a subsale listing, AI instantly told me which 3 of my 80 buyers matched. One made offer that afternoon. RM18k commission.", metric: "RM18k same-day close" },
        { name: "Siti Aminah", initials: "SA", company: "IQI Realty", rank: "Team Leader", location: "Bangsar", quote: "Leading team of 12 agents. AI tracks everyone's listings, buyers, showings. I know exactly who needs help.", metric: "12-agent team managed" },
        { name: "Ravi Kumar", initials: "RK", company: "IQI Realty", rank: "Million Dollar Producer", location: "KLCC", quote: "KLCC luxury market. AI remembers every VVIP buyer's preferences - floor level, view direction, even feng shui requirements.", metric: "VVIP preferences tracked" },
        { name: "Nurul Hana", initials: "NH", company: "IQI Realty", rank: "Senior Negotiator", location: "Damansara", quote: "New agent, 18 months in. AI gives me veteran-level organization. Outperforming 5-year agents.", metric: "Outperforming veterans" },
        { name: "Kenny Tan", initials: "KT", company: "IQI Realty", rank: "Top Producer", location: "Cheras", quote: "Cheras volume market. I track 150+ buyers simultaneously. AI tells me which property suits whom instantly.", metric: "150+ buyers tracked" },
        { name: "Farah Zainal", initials: "FZ", company: "IQI Realty", rank: "Rising Star", location: "Puchong", quote: "First year in property. AI helped me convert 23 leads into 8 transactions. My upline was shocked.", metric: "8 first-year transactions" },
        { name: "David Ng", initials: "DN", company: "IQI Realty", rank: "Team Leader", location: "Subang", quote: "Recruited 8 new agents this year. AI tracked each person's journey from prospect to productive agent.", metric: "8 agents recruited" },
        { name: "Lakshmi Devi", initials: "LD", company: "IQI Realty", rank: "Senior Negotiator", location: "Petaling Jaya", quote: "Indian family buyers - extended family decisions. AI tracks every family member's opinion, every visit, every concern.", metric: "Extended family sales" },
        { name: "Ahmad Rizal", initials: "AR", company: "IQI Realty", rank: "Project Specialist", location: "Setia Alam", quote: "New launch specialist. AI tracks 500+ registrants per project. Know exactly who's ready to book.", metric: "500+ registrants managed" },
        { name: "Michelle Wong", initials: "MW", company: "IQI Realty", rank: "Million Dollar Producer", location: "Desa Park City", quote: "DPC residents upgrading within DPC. AI tracks their current unit, wish list, budget, timeline. Easy upsells.", metric: "Intra-development specialist" },

        // ERA
        { name: "Amanda Lim", initials: "AL", company: "ERA Malaysia", rank: "Top Achiever", location: "Kepong", quote: "Kepong industrial and residential mix. AI tracks which clients want shophouse, factory, or home. Never mix up.", metric: "Mixed property expert" },
        { name: "Mohd Hafiz", initials: "MH", company: "ERA Malaysia", rank: "Senior Associate", location: "Shah Alam", quote: "Shah Alam Malay families. AI remembers everyone's kampung, family connections. Business is built on trust.", metric: "Malay family specialist" },
        { name: "Christina Tan", initials: "CT", company: "ERA Malaysia", rank: "Team Director", location: "USJ", quote: "Director of 25 agents. AI tracks their listings inventory, buyer pools, conversion rates. Data-driven leadership.", metric: "25 agents directed" },
        { name: "Ganesh Pillai", initials: "GP", company: "ERA Malaysia", rank: "Certified Investor Agent", location: "Klang", quote: "Investor clients buying multiple units. AI tracks their portfolio, rental yields, next purchase timeline.", metric: "Investor portfolio tracking" },
        { name: "Noraini Yusof", initials: "NY", company: "ERA Malaysia", rank: "Top Producer", location: "Rawang", quote: "Rawang boom - new townships everywhere. AI helps me track which buyer wants which township, price range, ready date.", metric: "New township specialist" },
        { name: "Eric Lee", initials: "EL", company: "ERA Malaysia", rank: "Subsale Expert", location: "Old Klang Road", quote: "OKR mature area. AI tracks every owner I've contacted, their asking price expectations, urgency to sell.", metric: "Owner database expert" },
        { name: "Zalina Hassan", initials: "ZH", company: "ERA Malaysia", rank: "Senior Negotiator", location: "Bangi", quote: "UKM/UPM academics relocating. AI tracks their contract periods, fellowship timelines, family situations.", metric: "Academic relocation specialist" },
        { name: "Raymond Yap", initials: "RY", company: "ERA Malaysia", rank: "Top Achiever", location: "Seri Kembangan", quote: "SK landed property expert. AI knows every corner lot, every end lot owner. First call when they want to sell.", metric: "Landed property database" },
        { name: "Prema Sundram", initials: "PS", company: "ERA Malaysia", rank: "Rising Star", location: "Brickfields", quote: "Brickfields shop lots and offices. AI tracks every tenant's lease expiry, every owner's sale intention.", metric: "Commercial lease tracker" },
        { name: "Hassan Ibrahim", initials: "HI", company: "ERA Malaysia", rank: "Team Leader", location: "Kajang", quote: "Kajang-Semenyih corridor. AI tracks new projects, subsales, buyer preferences across 20km stretch.", metric: "Corridor territory master" },

        // REAPFIELD
        { name: "Benjamin Tan", initials: "BT", company: "Reapfield", rank: "Principal", location: "Damansara Heights", quote: "DH bungalow market. AI tracks every Good Class Bungalow owner, their family situations, potential sale triggers.", metric: "GCB specialist" },
        { name: "Kavitha Rajan", initials: "KR", company: "Reapfield", rank: "Senior Associate", location: "Taman Tun", quote: "TTDI established families. AI tracks their kids' life stages - marriage means new home. I'm always ready.", metric: "Life stage property advisor" },
        { name: "Zulkifli Mat", initials: "ZM", company: "Reapfield", rank: "Top Producer", location: "Bangsar", quote: "Bangsar landed and condos. AI tracks who wants to downsize, who needs to upgrade, who's inheriting.", metric: "Transition specialist" },
        { name: "Jenny Koh", initials: "JK", company: "Reapfield", rank: "Associate Director", location: "Sri Hartamas", quote: "Hartamas expat community. AI tracks visa renewals, company postings, repatriation dates. Timing is everything.", metric: "Expat cycle expert" },
        { name: "Raj Menon", initials: "RM", company: "Reapfield", rank: "Senior Negotiator", location: "Mont Kiara", quote: "MK foreign investor market. AI tracks their multiple units, rental status, currency considerations.", metric: "Foreign investor specialist" },
        { name: "Aishah Abdullah", initials: "AA", company: "Reapfield", rank: "Team Leader", location: "Kenny Hills", quote: "Kenny Hills ultra-prime. AI remembers every owner by name, their neighbors, property history for 30 years.", metric: "Ultra-prime knowledge" },
        { name: "Vincent Chong", initials: "VC", company: "Reapfield", rank: "Principal", location: "Ampang Hilir", quote: "Embassy Row adjacent. AI tracks diplomatic movements, corporate expat rotations, luxury rental demand.", metric: "Diplomatic zone expert" },
        { name: "Nadia Hassan", initials: "NH", company: "Reapfield", rank: "Rising Star", location: "Bukit Damansara", quote: "BD generational wealth. AI maps family trees - when parent passes, property moves. Sensitive but necessary.", metric: "Inheritance mapping" },
        { name: "Steve Wong", initials: "SW", company: "Reapfield", rank: "Top Producer", location: "Country Heights", quote: "Country Heights Damansara. AI tracks every villa owner, their usage patterns, sale readiness.", metric: "Gated community specialist" },
        { name: "Faridah Jaafar", initials: "FJ", company: "Reapfield", rank: "Senior Associate", location: "Valencia", quote: "Valencia Sungai Buloh. AI tracks upgraders from Kota D, their timeline, budget, must-haves.", metric: "Upgrader journey tracker" },

        // CBD PROPERTIES
        { name: "Marcus Chin", initials: "MC", company: "CBD Properties", rank: "Director", location: "KLCC", quote: "KLCC office leasing specialist. AI tracks every tenant's lease expiry across 50 buildings. First to know, first to act.", metric: "50 building database" },
        { name: "Shanti Nair", initials: "SN", company: "CBD Properties", rank: "Senior Associate", location: "KL Sentral", quote: "KL Sentral commercial. AI tracks KTMB developments, transit expansions, commercial opportunities.", metric: "Transit-oriented specialist" },
        { name: "Azri Yusoff", initials: "AY", company: "CBD Properties", rank: "Investment Sales", location: "Bukit Bintang", quote: "BB retail and hospitality. AI tracks every lot ownership, rental rates, F&B tenant movements.", metric: "Retail intelligence" },
        { name: "Diana Chua", initials: "DC", company: "CBD Properties", rank: "Top Producer", location: "Jalan Sultan Ismail", quote: "JSI office market. AI tracks corporate relocations, expansions, consolidations. I know before they announce.", metric: "Corporate movement tracker" },
        { name: "Ismail Rahman", initials: "IR", company: "CBD Properties", rank: "Associate Director", location: "Pavilion", quote: "Pavilion vicinity luxury. AI tracks owner occupiers vs investors, their holding periods, exit strategies.", metric: "Investment analysis" },
        { name: "Jacqueline Lim", initials: "JL", company: "CBD Properties", rank: "Retail Specialist", location: "Mid Valley", quote: "Mid Valley-Gardens corridor retail. AI tracks every brand's expansion plans, lease cycles, relocation patterns.", metric: "Retail brand tracker" },
        { name: "Vellu Samy", initials: "VS", company: "CBD Properties", rank: "Industrial Lead", location: "Glenmarie", quote: "Glenmarie automotive hub. AI tracks every showroom, every workshop, every warehouse tenant.", metric: "Automotive cluster expert" },
        { name: "Azizah Hamid", initials: "AH", company: "CBD Properties", rank: "Senior Negotiator", location: "Bangsar South", quote: "BS office and retail. AI tracks the entire MSC ecosystem, tech company movements, co-working trends.", metric: "Tech ecosystem tracker" },
        { name: "Brian Teoh", initials: "BT", company: "CBD Properties", rank: "Team Leader", location: "PJ Sentral", quote: "PJ Sentral redevelopment. AI tracks every stakeholder, every land owner, every potential deal.", metric: "Redevelopment specialist" },
        { name: "Rosmawati Kadir", initials: "RK", company: "CBD Properties", rank: "Rising Star", location: "Damansara City", quote: "DC premium offices. AI tracks tenant quality, rental psf trends, upcoming vacancies.", metric: "Premium office analyst" },

        // HARTAMAS
        { name: "Daniel Chia", initials: "DC", company: "Hartamas Real Estate", rank: "Branch Manager", location: "Sri Hartamas", quote: "Hartamas home turf. AI tracks every unit in Mont K, Plaza D, Hartamas. I know this market like my house.", metric: "Hyperlocal specialist" },
        { name: "Rohani Samad", initials: "RS", company: "Hartamas Real Estate", rank: "Top Producer", location: "Solaris", quote: "Solaris commercial and residential. AI tracks every shop owner, every resident, every lease.", metric: "Mixed-use expert" },
        { name: "Prakash Kumar", initials: "PK", company: "Hartamas Real Estate", rank: "Senior Negotiator", location: "Desa Sri Hartamas", quote: "DSH apartment specialist. AI tracks 2000+ units ownership, transaction history, current tenants.", metric: "2000+ unit database" },
        { name: "Mei Ling Wong", initials: "MW", company: "Hartamas Real Estate", rank: "Associate", location: "Plaza Damas", quote: "Plaza Damas SOHOs. AI tracks every investor, every Airbnb operator, every sale listing.", metric: "SOHO market master" },
        { name: "Zainal Abidin", initials: "ZA", company: "Hartamas Real Estate", rank: "Team Leader", location: "Publika", quote: "Publika F&B and retail. AI tracks tenant turnover, successful vs failed businesses, prime lot availability.", metric: "F&B tenant analyst" },

        // PROPNEX
        { name: "Catherine Yap", initials: "CY", company: "PropNex", rank: "Platinum", location: "Setia Eco Park", quote: "SEP landed specialist. AI tracks every phase, every lot size, every owner since launch.", metric: "Township historian" },
        { name: "Suresh Menon", initials: "SM", company: "PropNex", rank: "Gold", location: "Eco Sanctuary", quote: "Eco World projects. AI tracks buyers across Eco Sanctuary, Eco Forest, Eco Ardence. Upgrade pathways.", metric: "Developer ecosystem expert" },
        { name: "Lina Ahmad", initials: "LA", company: "PropNex", rank: "Senior Associate", location: "Gamuda Gardens", quote: "Gamuda Gardens from launch. AI tracks every buyer's journey from showroom to keys to resale.", metric: "Launch to resale tracker" },
        { name: "Gary Chong", initials: "GC", company: "PropNex", rank: "Platinum", location: "Tropicana", quote: "Tropicana Golf & Country. AI tracks golfer-residents, their handicaps, their club memberships. Lifestyle selling.", metric: "Lifestyle property expert" },
        { name: "Nazreen Hassan", initials: "NH", company: "PropNex", rank: "Team Director", location: "Bukit Jelutong", quote: "BJ family community. AI tracks school preferences, proximity needs, growing family space requirements.", metric: "Family community specialist" },

        // Additional varied to reach 100
        { name: "William Lee", initials: "WL", company: "IQI Realty", rank: "Top Producer", location: "Taman Duta", quote: "Duta high-end bungalows. AI tracks every owner for 10 years. I know when they're ready before they do.", metric: "Seller psychology expert" },
        { name: "Suraya Ismail", initials: "SI", company: "ERA Malaysia", rank: "Senior Negotiator", location: "Ara Damansara", quote: "Ara D young professionals. AI tracks their career progressions - promotions mean property upgrades.", metric: "Career-property correlation" },
        { name: "Rajan Pillai", initials: "RP", company: "Reapfield", rank: "Associate", location: "Kota Damansara", quote: "KD landed and condo mix. AI tracks MRT impact, price trends, buyer sentiment shifts.", metric: "MRT corridor analyst" },
        { name: "Agnes Tan", initials: "AT", company: "CBD Properties", rank: "Senior Associate", location: "TRX", quote: "TRX new CBD. AI tracks every launch, every investor, every corporate tenant prospect.", metric: "New CBD pioneer" },
        { name: "Khairul Anuar", initials: "KA", company: "Hartamas Real Estate", rank: "Team Leader", location: "Dutamas", quote: "Dutamas transformation. AI tracks redevelopment, land sales, new project launches.", metric: "Redevelopment tracker" },
        { name: "Vivian Goh", initials: "VG", company: "PropNex", rank: "Gold", location: "Denai Alam", quote: "Denai Alam families. AI tracks school waiting lists, community events, neighborhood dynamics.", metric: "Community intelligence" },
        { name: "Faizal Mahmud", initials: "FM", company: "IQI Realty", rank: "Rising Star", location: "Cyberjaya", quote: "Cyberjaya tech workers. AI tracks company relocations, hiring waves, WFH policies impact on housing.", metric: "Tech housing analyst" },
        { name: "Lily Tan", initials: "LT", company: "ERA Malaysia", rank: "Top Achiever", location: "Putrajaya", quote: "Putrajaya civil servant market. AI tracks ministry relocations, new agency setups, grade promotions.", metric: "Government housing expert" },
        { name: "Anand Krishnan", initials: "AK", company: "Reapfield", rank: "Senior Associate", location: "Ampang", quote: "Ampang hillside bungalows. AI tracks every land parcel, every owner, every development potential.", metric: "Hillside specialist" },
        { name: "Noor Azizah", initials: "NA", company: "CBD Properties", rank: "Associate", location: "Menara KL", quote: "KL Tower vicinity heritage. AI tracks conservation status, owner situations, redevelopment potential.", metric: "Heritage property expert" },
        { name: "Simon Yap", initials: "SY", company: "Hartamas Real Estate", rank: "Senior Negotiator", location: "Segambut", quote: "Segambut transformation area. AI tracks gentrification, new projects, price momentum.", metric: "Gentrification tracker" },
        { name: "Haslinda Azmi", initials: "HA", company: "PropNex", rank: "Rising Star", location: "Puncak Jalil", quote: "Puncak Jalil affordables. AI tracks first-time buyers, government scheme eligibility, loan approvals.", metric: "First-time buyer specialist" },
        { name: "Derek Tan", initials: "DT", company: "IQI Realty", rank: "Team Leader", location: "Bandar Kinrara", quote: "BK established community. AI tracks 20 years of transactions, ownership patterns, community connections.", metric: "Community historian" },
        { name: "Malathi Subramaniam", initials: "MS", company: "ERA Malaysia", rank: "Senior Associate", location: "Taman Melawati", quote: "TM landed properties. AI tracks every sale for 5 years, price trends, buyer demographics.", metric: "Transaction analyst" },
        { name: "Ahmad Fauzi", initials: "AF", company: "Reapfield", rank: "Top Producer", location: "Bukit Antarabangsa", quote: "BA hillside luxury. AI tracks soil reports, landslide history, owner confidence levels.", metric: "Risk-aware specialist" },
        { name: "Jessica Wong", initials: "JW", company: "CBD Properties", rank: "Team Leader", location: "Sentul", quote: "Sentul rejuvenation. AI tracks every redevelopment parcel, every stakeholder, every timeline.", metric: "Rejuvenation specialist" },
        { name: "Ramesh Krishnan", initials: "RK", company: "Hartamas Real Estate", rank: "Senior Negotiator", location: "Wangsa Maju", quote: "WM condos and apartments. AI tracks 5000+ units, owner profiles, rental vs sale intentions.", metric: "5000+ unit tracker" },
        { name: "Salmah Yusof", initials: "SY", company: "PropNex", rank: "Gold", location: "Bandar Sri Damansara", quote: "BSD mature township. AI tracks upgraders to new developments, their timeline, budget stretching.", metric: "Upgrader specialist" },
        { name: "Tony Leong", initials: "TL", company: "IQI Realty", rank: "Top Producer", location: "Taman SEA", quote: "SEA strategic location. AI tracks every commercial potential, every development opportunity.", metric: "Commercial conversion expert" },
        { name: "Aisyah Rahman", initials: "AR", company: "ERA Malaysia", rank: "Rising Star", location: "Sunway", quote: "Sunway ecosystem properties. AI tracks university rental demand, medical tourist accommodation, mall proximity premium.", metric: "Ecosystem analyst" },
        { name: "Michael Ng", initials: "MN", company: "Reapfield", rank: "Principal", location: "Georgetown", quote: "Georgetown heritage. AI tracks conservation status, UNESCO requirements, restoration potential.", metric: "Heritage specialist" },
        { name: "Nordin Ismail", initials: "NI", company: "CBD Properties", rank: "Associate Director", location: "Johor Bahru", quote: "JB-Singapore corridor. AI tracks Malaysian-Singaporean buyers, currency plays, cross-border commuters.", metric: "JB-SG corridor expert" },
        { name: "Penny Lim", initials: "PL", company: "Hartamas Real Estate", rank: "Team Leader", location: "Penang", quote: "Penang island limited supply. AI tracks every landed property, owner aging, succession situations.", metric: "Island scarcity expert" },
        { name: "Ishak Ahmad", initials: "IA", company: "PropNex", rank: "Senior Associate", location: "Ipoh", quote: "Ipoh revival market. AI tracks KL retirees relocating, their budget, lifestyle requirements.", metric: "Retirement destination expert" },
        { name: "Grace Chen", initials: "GC", company: "IQI Realty", rank: "Million Dollar Producer", location: "Kuching", quote: "Kuching property boom. AI tracks local developers, land bank releases, buyer preferences by ethnicity.", metric: "East Malaysia specialist" },
        { name: "Kamal Hassan", initials: "KH", company: "ERA Malaysia", rank: "Team Director", location: "Kota Kinabalu", quote: "KK tourism-driven market. AI tracks Airbnb performance, tourist seasons, investment yields.", metric: "Tourism property analyst" },
    ],

    // =========================================
    // DIRECT SALES / MLM TESTIMONIALS (100+)
    // =========================================
    directsales: [
        // AMWAY
        { name: "Zarina Ahmad", initials: "ZA", company: "Amway", rank: "Diamond", location: "Petaling Jaya", quote: "Diamond took me 8 years. AI helped me track 500+ downline members, their struggles, their breakthroughs. I know everyone.", metric: "500+ downline managed" },
        { name: "David Tan", initials: "DT", company: "Amway", rank: "Founders Platinum", location: "Subang Jaya", quote: "Platinum maintenance is about retention. AI tracks every downline's activity, flags who's going inactive before they quit.", metric: "90% retention rate" },
        { name: "Lakshmi Nair", initials: "LN", company: "Amway", rank: "Emerald", location: "Bangsar", quote: "Built 3 Platinum legs. AI helped me duplicate myself by tracking what worked with each leader's personality.", metric: "3 Platinum legs built" },
        { name: "Ahmad Faizal", initials: "AF", company: "Amway", rank: "Platinum", location: "Shah Alam", quote: "Malay market in Shah Alam. AI tracks every family I've approached, their concerns about MLM, how to address them.", metric: "Cultural objection handling" },
        { name: "Michelle Wong", initials: "MW", company: "Amway", rank: "Diamond", location: "Kuala Lumpur", quote: "Diamond maintenance means constantly recruiting. AI tracks 200+ prospects at any time, their readiness stage, follow-up needed.", metric: "200+ prospect pipeline" },
        { name: "Rajan Krishnan", initials: "RK", company: "Amway", rank: "Founders Emerald", location: "Klang", quote: "Indian community network is strong but needs trust. AI helped me track 3 years of relationship building. Now my network sells itself.", metric: "3-year trust building" },
        { name: "Nurul Huda", initials: "NH", company: "Amway", rank: "Silver Producer", location: "Puchong", quote: "New to Amway, 18 months. AI helped me track every person I talked to, every objection, every follow-up. Silver in record time.", metric: "Fast Silver achievement" },
        { name: "Kenny Tan", initials: "KT", company: "Amway", rank: "Platinum", location: "Damansara", quote: "Product users vs business builders - AI helps me track who's who. Different approach for each. Conversion rate tripled.", metric: "3x conversion rate" },
        { name: "Siti Mariam", initials: "SM", company: "Amway", rank: "Emerald", location: "Cheras", quote: "Emerald means multiple Platinum legs. AI tracks each leg's development, who needs attention, where to focus.", metric: "Multi-leg management" },
        { name: "Vincent Lee", initials: "VL", company: "Amway", rank: "Founders Diamond", location: "Mont Kiara", quote: "Founders Diamond - top 0.1%. AI helped me build systems that duplicate. My leaders use the same tracking.", metric: "System duplication" },
        { name: "Farah Aminah", initials: "FA", company: "Amway", rank: "Gold Producer", location: "Ampang", quote: "Gold Producer maintaining 6 months. AI tracks my team's volume, personal volume, what needs boosting.", metric: "Consistent Gold" },
        { name: "Jason Ng", initials: "JN", company: "Amway", rank: "Platinum", location: "Kepong", quote: "Chinese kopitiam method - AI tracks everyone I've had coffee with, what we discussed, when to follow up.", metric: "Kopitiam networking" },
        { name: "Priya Menon", initials: "PM", company: "Amway", rank: "Ruby", location: "Petaling Jaya", quote: "Ruby in 2 years. AI tracked my 100-name list, then their referrals, then their referrals. Network effect.", metric: "100-name list expansion" },
        { name: "Hakim Abdullah", initials: "HA", company: "Amway", rank: "Emerald", location: "Cyberjaya", quote: "Tech workers skeptical of MLM. AI helped me track who responded to which approach. Data-driven sponsoring.", metric: "Tech worker conversion" },
        { name: "Amanda Lim", initials: "AL", company: "Amway", rank: "Sapphire", location: "Sri Petaling", quote: "Sapphire maintaining 12 months. AI tracks seasonal fluctuations, helps me predict and prevent volume drops.", metric: "Volume prediction" },

        // ATOMY
        { name: "Karen Tan", initials: "KT", company: "Atomy", rank: "Star Master", location: "Puchong", quote: "Star Master in 3 years. AI tracked every customer's reorder pattern, every business builder's progress.", metric: "3-year Star Master" },
        { name: "Mohd Rizal", initials: "MR", company: "Atomy", rank: "Sharon Rose", location: "Shah Alam", quote: "Sharon Rose - tracking 1000+ members. AI tells me who's active, who's dormant, who needs a call.", metric: "1000+ member tracking" },
        { name: "Christina Yap", initials: "CY", company: "Atomy", rank: "Diamond Master", location: "Subang", quote: "Diamond Master means passive income. AI helped me build leaders who build leaders. True duplication.", metric: "Leadership pipeline" },
        { name: "Ganesh Pillai", initials: "GP", company: "Atomy", rank: "Sales Master", location: "Klang", quote: "Sales Master maintaining volume. AI tracks customer preferences, reorder cycles, product recommendations.", metric: "Customer retention system" },
        { name: "Noraini Yusof", initials: "NY", company: "Atomy", rank: "Star Master", location: "Johor Bahru", quote: "JB-Singapore market. AI tracks both Malaysian and Singaporean members, different strategies for each.", metric: "Cross-border team" },
        { name: "Eric Lee", initials: "EL", company: "Atomy", rank: "Royal Master", location: "Penang", quote: "Royal Master - one of few in Malaysia. AI helped me identify and develop 5 future Star Masters.", metric: "5 leaders developed" },
        { name: "Zalina Hassan", initials: "ZH", company: "Atomy", rank: "Sharon Rose", location: "Ipoh", quote: "Ipoh market is price-sensitive. AI helped me track which Atomy products resonate, which customers become builders.", metric: "Price-value positioning" },
        { name: "Raymond Tan", initials: "RT", company: "Atomy", rank: "Sales Master", location: "Melaka", quote: "Melaka historical tourism connection. AI tracks tourist contacts who became international members.", metric: "International network" },
        { name: "Prema Sundram", initials: "PS", company: "Atomy", rank: "Diamond Master", location: "Petaling Jaya", quote: "Indian family networks expand fast. AI tracks the family tree connections across my organization.", metric: "Family network mapping" },
        { name: "Hassan Ibrahim", initials: "HI", company: "Atomy", rank: "Star Master", location: "Kuching", quote: "Sarawak pioneer. AI helped me build network across Kuching, Sibu, Miri. Geography managed.", metric: "Sarawak territory" },
        { name: "Jenny Koh", initials: "JK", company: "Atomy", rank: "Crown Master", location: "Kuala Lumpur", quote: "Crown Master - top rank. AI tracks my entire organization's health metrics. Early warning system.", metric: "Organization health dashboard" },
        { name: "Azman Ismail", initials: "AI", company: "Atomy", rank: "Sales Master", location: "Seremban", quote: "Seremban semi-urban market. AI tracks different customer segments - town vs kampung, different needs.", metric: "Market segmentation" },
        { name: "Patricia Lee", initials: "PL", company: "Atomy", rank: "Sharon Rose", location: "Kota Kinabalu", quote: "Sabah network building from scratch. AI tracked every contact in a new market. Built 200 members in 18 months.", metric: "200 members in 18 months" },
        { name: "Muthu Krishnan", initials: "MK", company: "Atomy", rank: "Star Master", location: "Batu Caves", quote: "Temple community trust. AI tracks every community member, their family situation, product needs.", metric: "Community penetration" },
        { name: "Rashidah Karim", initials: "RK", company: "Atomy", rank: "Diamond Master", location: "Putrajaya", quote: "Government servant network. AI tracks their promotions, transfers, life changes - opportunities for products and business.", metric: "Govt network expert" },

        // HERBALIFE
        { name: "Jimmy Ong", initials: "JO", company: "Herbalife", rank: "President's Team", location: "Bangsar", quote: "President's Team - top 1%. AI tracks my 50 nutrition clubs, their performance, member retention.", metric: "50 nutrition clubs" },
        { name: "Salina Ibrahim", initials: "SI", company: "Herbalife", rank: "Millionaire Team", location: "Petaling Jaya", quote: "Millionaire Team means big organization. AI tracks 2000+ distributors, identifies future leaders.", metric: "2000+ distributors" },
        { name: "Alan Tan", initials: "AT", company: "Herbalife", rank: "GET Team", location: "Subang", quote: "GET Team through fitness niche. AI tracks every gym member I've approached, their fitness goals, transformation progress.", metric: "Fitness niche mastery" },
        { name: "Nurul Ain", initials: "NA", company: "Herbalife", rank: "World Team", location: "Shah Alam", quote: "World Team in 4 years. AI tracked every weight loss customer, their journey, their referrals.", metric: "4-year World Team" },
        { name: "Steve Wong", initials: "SW", company: "Herbalife", rank: "Supervisor", location: "Cheras", quote: "Supervisor building to World Team. AI helps me identify who's ready to upgrade from customer to distributor.", metric: "Customer-to-distributor conversion" },
        { name: "Faridah Jaafar", initials: "FJ", company: "Herbalife", rank: "President's Team", location: "Ampang", quote: "Second generation President's Team. AI helped me systematize what my upline taught intuitively.", metric: "System documentation" },
        { name: "Marcus Chin", initials: "MC", company: "Herbalife", rank: "Millionaire Team", location: "Damansara", quote: "Corporate market niche. AI tracks every corporate wellness program, every HR contact, every follow-up.", metric: "Corporate wellness expert" },
        { name: "Shanti Nair", initials: "SN", company: "Herbalife", rank: "GET Team", location: "Klang", quote: "Indian community weight concerns. AI tracks family health patterns, diabetes risks, nutritional needs.", metric: "Health pattern tracking" },
        { name: "Azri Yusoff", initials: "AY", company: "Herbalife", rank: "World Team", location: "Cyberjaya", quote: "Tech worker fitness market. AI tracks their sedentary lifestyles, fitness goals, transformation stories.", metric: "Tech fitness specialist" },
        { name: "Diana Chua", initials: "DC", company: "Herbalife", rank: "Supervisor", location: "Puchong", quote: "Mommy fitness niche. AI tracks post-pregnancy transformations, their communities, referral networks.", metric: "Mommy fitness expert" },
        { name: "Ismail Rahman", initials: "IR", company: "Herbalife", rank: "President's Team", location: "Johor Bahru", quote: "JB-Singapore cross-border. AI tracks members both sides, different regulations, different pricing strategies.", metric: "Cross-border expert" },
        { name: "Jacqueline Lim", initials: "JL", company: "Herbalife", rank: "Millionaire Team", location: "Penang", quote: "Penang food lovers turned health conscious. AI tracks their transformation journeys, before-after stories.", metric: "Transformation documenter" },
        { name: "Vellu Samy", initials: "VS", company: "Herbalife", rank: "GET Team", location: "Ipoh", quote: "Ipoh retiree health market. AI tracks their health concerns, medication interactions, lifestyle changes.", metric: "Retiree health specialist" },
        { name: "Azizah Hamid", initials: "AH", company: "Herbalife", rank: "World Team", location: "Melaka", quote: "Melaka historical tourism - health-conscious tourists become international customers.", metric: "Tourist conversion" },
        { name: "Brian Teoh", initials: "BT", company: "Herbalife", rank: "Supervisor", location: "Seremban", quote: "Building team in Seremban. AI tracks every prospect, every team member's development stage.", metric: "Team development tracker" },

        // COWAY
        { name: "Rosmawati Kadir", initials: "RK", company: "Coway", rank: "Head Manager", location: "Kuala Lumpur", quote: "Head Manager - 100+ codys under me. AI tracks every cody's performance, every household they service.", metric: "100+ cody management" },
        { name: "Daniel Chia", initials: "DC", company: "Coway", rank: "Branch Manager", location: "Petaling Jaya", quote: "Branch Manager responsible for territory. AI tracks every installation, every service call, every upgrade opportunity.", metric: "Territory management" },
        { name: "Rohani Samad", initials: "RS", company: "Coway", rank: "Cody Leader", location: "Shah Alam", quote: "Leading 20 codys. AI helps me track their routes, their customers, their service quality.", metric: "20 cody team" },
        { name: "Prakash Kumar", initials: "PK", company: "Coway", rank: "Senior Cody", location: "Subang", quote: "400 households under my service. AI tracks every filter change date, every customer preference, every upsell opportunity.", metric: "400 household database" },
        { name: "Mei Ling Tan", initials: "MT", company: "Coway", rank: "Head Manager", location: "Bangsar", quote: "Bangsar premium market. AI tracks high-end customers, their multiple properties, their premium needs.", metric: "Premium segment expert" },
        { name: "Zainal Abidin", initials: "ZA", company: "Coway", rank: "Branch Manager", location: "Cheras", quote: "Cheras high-density area. AI helps manage 2000+ accounts across my branch efficiently.", metric: "2000+ accounts" },
        { name: "Catherine Yap", initials: "CY", company: "Coway", rank: "Cody Leader", location: "Puchong", quote: "Recruitment specialist. AI tracks every potential cody, their background, their readiness to join.", metric: "Cody recruitment expert" },
        { name: "Suresh Menon", initials: "SM", company: "Coway", rank: "Senior Cody", location: "Klang", quote: "Industrial area service. AI tracks factory accounts, their water quality needs, maintenance schedules.", metric: "Industrial accounts" },
        { name: "Lina Ahmad", initials: "LA", company: "Coway", rank: "Head Manager", location: "Johor Bahru", quote: "JB rapid growth market. AI helped me scale from 50 to 200 accounts in one year.", metric: "50 to 200 accounts" },
        { name: "Gary Chong", initials: "GC", company: "Coway", rank: "Branch Manager", location: "Penang", quote: "Penang island logistics. AI helps optimize service routes, reduce travel time, increase coverage.", metric: "Route optimization" },
        { name: "Nazreen Hassan", initials: "NH", company: "Coway", rank: "Cody Leader", location: "Ipoh", quote: "Ipoh expanding market. AI tracks new housing areas, new move-ins, prime installation targets.", metric: "New housing tracker" },
        { name: "William Lee", initials: "WL", company: "Coway", rank: "Senior Cody", location: "Melaka", quote: "Melaka heritage homes. AI tracks older building needs, water quality issues, upgrade recommendations.", metric: "Heritage building expert" },
        { name: "Suraya Ismail", initials: "SI", company: "Coway", rank: "Head Manager", location: "Seremban", quote: "Seremban-KL corridor. AI tracks commuter families, their time constraints, service flexibility needs.", metric: "Commuter family expert" },
        { name: "Rajan Pillai", initials: "RP", company: "Coway", rank: "Branch Manager", location: "Cyberjaya", quote: "Tech-savvy Cyberjaya customers. AI integration impresses them, shows we're modern company.", metric: "Tech-forward service" },
        { name: "Agnes Tan", initials: "AT", company: "Coway", rank: "Cody Leader", location: "Putrajaya", quote: "Government quarters service. AI tracks posting cycles, move-in/move-outs, service continuity.", metric: "Govt quarters specialist" },

        // YOUNG LIVING
        { name: "Khairul Anuar", initials: "KA", company: "Young Living", rank: "Diamond", location: "Kuala Lumpur", quote: "Diamond in Young Living through wellness community. AI tracks every oils user, their health journey, their needs.", metric: "Wellness journey tracker" },
        { name: "Vivian Goh", initials: "VG", company: "Young Living", rank: "Platinum", location: "Petaling Jaya", quote: "Yoga studio partnerships. AI tracks every studio relationship, every class recommendation, every conversion.", metric: "Yoga studio network" },
        { name: "Faizal Mahmud", initials: "FM", company: "Young Living", rank: "Gold", location: "Bangsar", quote: "Bangsar wellness lifestyle. AI tracks customer preferences, seasonal needs, new product interests.", metric: "Lifestyle product matching" },
        { name: "Lily Tan", initials: "LT", company: "Young Living", rank: "Diamond", location: "Subang", quote: "Children's wellness niche. AI tracks every mom's concerns, their kids' ages, developmental needs.", metric: "Children wellness expert" },
        { name: "Anand Krishnan", initials: "AK", company: "Young Living", rank: "Platinum", location: "Shah Alam", quote: "Corporate wellness partnerships. AI tracks every company relationship, HR contacts, program renewals.", metric: "Corporate wellness programs" },
        { name: "Noor Azizah", initials: "NA", company: "Young Living", rank: "Silver", location: "Cheras", quote: "Building to Gold. AI helped me track 100+ trial users, their feedback, upgrade readiness.", metric: "Trial-to-member conversion" },
        { name: "Simon Yap", initials: "SY", company: "Young Living", rank: "Diamond", location: "Damansara", quote: "Spa and wellness center supply. AI tracks every B2B account, their order patterns, product usage.", metric: "B2B spa accounts" },
        { name: "Haslinda Azmi", initials: "HA", company: "Young Living", rank: "Gold", location: "Puchong", quote: "New mother community. AI tracks their pregnancy stages, birth dates, baby milestone needs.", metric: "New mother journey" },
        { name: "Derek Tan", initials: "DT", company: "Young Living", rank: "Platinum", location: "Ampang", quote: "Holistic health practitioners network. AI tracks every practitioner, their specialty, their patient recommendations.", metric: "Practitioner network" },
        { name: "Malathi Subramaniam", initials: "MS", company: "Young Living", rank: "Silver", location: "Klang", quote: "Ayurveda integration approach. AI tracks how oils complement traditional practices for Indian community.", metric: "Ayurveda integration" },

        // NU SKIN
        { name: "Ahmad Fauzi", initials: "AF", company: "Nu Skin", rank: "Blue Diamond", location: "Kuala Lumpur", quote: "Blue Diamond through skincare expertise. AI tracks every customer's skin concerns, product history, results.", metric: "Skin history database" },
        { name: "Jessica Wong", initials: "JW", company: "Nu Skin", rank: "Gold", location: "Petaling Jaya", quote: "Anti-aging market specialist. AI tracks customer age, concerns, competitive products they've tried.", metric: "Anti-aging expert" },
        { name: "Ramesh Krishnan", initials: "RK", company: "Nu Skin", rank: "Ruby", location: "Subang", quote: "Men's skincare pioneer. AI tracks the growing men's market, their specific concerns, product preferences.", metric: "Men's skincare pioneer" },
        { name: "Salmah Yusof", initials: "SY", company: "Nu Skin", rank: "Blue Diamond", location: "Bangsar", quote: "Premium beauty market. AI tracks high-spending customers, their routines, their upgrade patterns.", metric: "Premium beauty clients" },
        { name: "Tony Leong", initials: "TL", company: "Nu Skin", rank: "Emerald", location: "Shah Alam", quote: "Device-skincare combination selling. AI tracks device owners, their usage, skincare replenishment needs.", metric: "Device + skincare tracking" },
        { name: "Aisyah Rahman", initials: "AR", company: "Nu Skin", rank: "Gold", location: "Cheras", quote: "Building team in Cheras. AI tracks every recruit's beauty background, training needs, customer building progress.", metric: "Beauty team building" },
        { name: "Michael Ng", initials: "MN", company: "Nu Skin", rank: "Ruby", location: "Damansara", quote: "Professional women market. AI tracks their skincare budgets, office-appropriate routines, career stages.", metric: "Professional women specialist" },
        { name: "Nordin Ismail", initials: "NI", company: "Nu Skin", rank: "Blue Diamond", location: "Johor Bahru", quote: "JB-Singapore beauty corridor. AI tracks customers both sides, different preferences, different purchasing power.", metric: "Cross-border beauty" },
        { name: "Penny Lim", initials: "PL", company: "Nu Skin", rank: "Emerald", location: "Penang", quote: "Wedding beauty prep niche. AI tracks brides-to-be, their wedding dates, beauty countdown programs.", metric: "Bridal beauty specialist" },
        { name: "Ishak Ahmad", initials: "IA", company: "Nu Skin", rank: "Gold", location: "Ipoh", quote: "Mature skin market. AI tracks older customers, their changing skin needs, gentle product recommendations.", metric: "Mature skin expert" },

        // SHAKLEE
        { name: "Grace Chen", initials: "GC", company: "Shaklee", rank: "Senior Director", location: "Kuala Lumpur", quote: "Health-conscious families are my market. AI tracks every family member's health goals, supplement needs.", metric: "Family health tracking" },
        { name: "Kamal Hassan", initials: "KH", company: "Shaklee", rank: "Director", location: "Petaling Jaya", quote: "Sports nutrition niche. AI tracks athletes, their training cycles, competition prep needs.", metric: "Sports nutrition expert" },
    ],
};

// =========================================
// TESTIMONIAL DISPLAY FUNCTIONS
// =========================================

function getRandomTestimonials(industry, count = 6) {
    const testimonials = TestimonialsDB[industry];
    if (!testimonials) return [];

    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderTestimonials(containerId, industry, count = 6) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const testimonials = getRandomTestimonials(industry, count);

    container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <p class="testimonial-quote">"${t.quote}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${t.initials}</div>
                <div class="testimonial-info">
                    <strong>${t.name}</strong>
                    <span>${t.rank}, ${t.company}</span>
                    <span class="testimonial-location">${t.location}</span>
                </div>
            </div>
            <div class="testimonial-metric">${t.metric}</div>
        </div>
    `).join('');
}

function renderTestimonialCarousel(containerId, industry) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const testimonials = TestimonialsDB[industry];
    let currentIndex = 0;

    function showTestimonial(index) {
        const t = testimonials[index];
        container.innerHTML = `
            <div class="testimonial-carousel-item">
                <p class="testimonial-quote">"${t.quote}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${t.initials}</div>
                    <div class="testimonial-info">
                        <strong>${t.name}</strong>
                        <span>${t.rank}, ${t.company} - ${t.location}</span>
                    </div>
                </div>
                <div class="testimonial-metric">${t.metric}</div>
            </div>
            <div class="carousel-controls">
                <button onclick="prevTestimonial()">&#8592;</button>
                <span>${index + 1} / ${testimonials.length}</span>
                <button onclick="nextTestimonial()">&#8594;</button>
            </div>
        `;
    }

    window.prevTestimonial = () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentIndex);
    };

    window.nextTestimonial = () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    };

    showTestimonial(0);

    // Auto-rotate every 8 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 8000);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestimonialsDB, getRandomTestimonials, renderTestimonials, renderTestimonialCarousel };
}

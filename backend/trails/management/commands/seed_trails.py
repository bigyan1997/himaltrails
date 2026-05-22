"""
Seed command: creates/updates all trails, itineraries, permits, and teahouses.
Safe to re-run — uses update_or_create on slug.
"""

from django.core.management.base import BaseCommand
from trails.models import Trail, Itinerary, Permit, Teahouse

TRAILS = [
    # ── Everest Base Camp ─────────────────────────────────────────────────────
    {
        "name": "Everest Base Camp Trek",
        "slug": "everest-base-camp",
        "region": "Khumbu",
        "description": (
            "The Everest Base Camp Trek is Nepal's most iconic high-altitude journey, "
            "threading through Sherpa villages, ancient monasteries, and rhododendron forests "
            "before depositing you beneath the world's highest peak at 5,364 m. "
            "Each acclimatisation day in Namche Bazaar or Dingboche reveals a wider panorama "
            "of the Khumbu giants — Lhotse, Nuptse, Ama Dablam — while the route stays on "
            "well-maintained teahouse trails, making it achievable for fit trekkers without "
            "technical climbing experience."
        ),
        "highlights": (
            "Stand at Everest Base Camp beneath the Khumbu Icefall\n"
            "Sunrise from Kala Patthar (5,545 m) overlooking Everest\n"
            "Tengboche Monastery set against the Ama Dablam massif\n"
            "Namche Bazaar — the gateway Sherpa capital\n"
            "Hillary suspension bridges over the Dudh Koshi gorge"
        ),
        "distance_km": "130.00",
        "elevation_gain_m": 4200,
        "max_altitude_m": 5545,
        "duration_days": 14,
        "difficulty": "hard",
        "trek_style": "teahouse",
        "start_point": "Lukla",
        "end_point": "Lukla",
        "best_seasons": "Mar–May, Sep–Dec",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "27.988056",
        "longitude": "86.925278",
        "cover_image_url": "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Trail open. Khumbu Icefall route active for climbers. Snow above 5000m — crampons recommended.",
        "condition_updated": "2026-04-15",
        "itinerary": [
            {"day": 1,  "title": "Lukla → Phakding",            "description": "Fly into Tenzing-Hillary Airport (2,860 m) and descend to Phakding.",                                          "altitude_m": 2652,  "walk_hours": 3.5},
            {"day": 2,  "title": "Phakding → Namche Bazaar",    "description": "Cross the famous Hillary Bridge and climb steeply to the Sherpa capital.",                                    "altitude_m": 3440,  "walk_hours": 5.5},
            {"day": 3,  "title": "Namche Bazaar — Acclimatise", "description": "Rest day. Hike to Everest View Hotel for the first Everest panorama.",                                       "altitude_m": 3440,  "walk_hours": 3.0},
            {"day": 4,  "title": "Namche → Tengboche",          "description": "Traverse contour paths past Phunki Tenga to the famous monastery ridge.",                                    "altitude_m": 3860,  "walk_hours": 5.0},
            {"day": 5,  "title": "Tengboche → Dingboche",       "description": "Descend to Pangboche then climb through juniper scrub to Dingboche.",                                        "altitude_m": 4410,  "walk_hours": 5.0},
            {"day": 6,  "title": "Dingboche — Acclimatise",     "description": "Hike to the Nagarjun Hill crest (5,100 m) for views of Makalu and Lhotse Face.",                            "altitude_m": 4410,  "walk_hours": 4.0},
            {"day": 7,  "title": "Dingboche → Lobuche",         "description": "Climb the lateral moraine past the Thukla memorials to the wind-swept Lobuche.",                            "altitude_m": 4940,  "walk_hours": 5.0},
            {"day": 8,  "title": "Lobuche → Gorak Shep → EBC",  "description": "Push to Gorak Shep, drop bags, and hike the final moraine to Base Camp.",                                   "altitude_m": 5364,  "walk_hours": 7.0},
            {"day": 9,  "title": "Gorak Shep → Kala Patthar → Pheriche", "description": "Pre-dawn summit of Kala Patthar for the definitive Everest sunrise, then descend to Pheriche.", "altitude_m": 4371,  "walk_hours": 8.0},
            {"day": 10, "title": "Pheriche → Namche Bazaar",    "description": "Long descent through Pangboche and Tengboche back to Namche.",                                               "altitude_m": 3440,  "walk_hours": 7.0},
            {"day": 11, "title": "Namche Bazaar → Lukla",       "description": "Final descent through the Dudh Koshi valley to Lukla airstrip.",                                            "altitude_m": 2860,  "walk_hours": 6.5},
            {"day": 12, "title": "Lukla → Kathmandu (fly)",     "description": "Morning flight back to Kathmandu — weather permitting.",                                                     "altitude_m": 1400,  "walk_hours": 0.0},
            {"day": 13, "title": "Buffer day — Lukla",          "description": "Mountain weather buffer. Extra rest or explore Lukla.",                                                      "altitude_m": 2860,  "walk_hours": 0.0},
            {"day": 14, "title": "Kathmandu — debrief",         "description": "Arrive Kathmandu, debrief, gear clean-up.",                                                                  "altitude_m": 1400,  "walk_hours": 0.0},
        ],
        "permits": [
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu (Pradarshani Marg); or TAAN office",
                "notes": "Individual trekkers $20; guided trekkers $10. Required even if you have other permits.",
            },
            {
                "name": "Sagarmatha National Park Entry",
                "permit_type": "national_park",
                "cost_usd": 30.00,
                "where_to_buy": "Department of National Parks office, Kathmandu; or the park gate at Monjo",
                "notes": "Valid for one entry. Keep the receipt — rangers check it multiple times on the trail.",
            },
            {
                "name": "Khumbu Pasang Lhamu Municipality Entry",
                "permit_type": "municipal",
                "cost_usd": 20.00,
                "where_to_buy": "Collected at checkpoints inside the Khumbu region",
                "notes": "Introduced in 2021. Fee goes to local infrastructure. Collected at Monjo or Lukla.",
            },
        ],
        "teahouses": [
            {"name": "Yak Hotel",            "location": "Namche Bazaar", "altitude_m": 3440, "price_usd_min": 10, "price_usd_max": 25, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 2,  "notes": "Good views, reliable wifi for Namche."},
            {"name": "Tengboche Tea House",  "location": "Tengboche",     "altitude_m": 3860, "price_usd_min": 8,  "price_usd_max": 18, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 4,  "notes": "Right next to the monastery. Basic but atmospheric."},
            {"name": "Himalayan Hotel",      "location": "Dingboche",     "altitude_m": 4410, "price_usd_min": 8,  "price_usd_max": 20, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 5,  "notes": "Good dal bhat and a warm common room."},
            {"name": "Pyramid Guest House",  "location": "Lobuche",       "altitude_m": 4940, "price_usd_min": 8,  "price_usd_max": 18, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 7,  "notes": "Basic, cold nights. Bring a good sleeping bag."},
            {"name": "Everest Inn",          "location": "Gorak Shep",    "altitude_m": 5140, "price_usd_min": 10, "price_usd_max": 20, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 8,  "notes": "Highest teahouse on the EBC route. Expect crowds in peak season."},
        ],
    },

    # ── Annapurna Circuit ─────────────────────────────────────────────────────
    {
        "name": "Annapurna Circuit Trek",
        "slug": "annapurna-circuit",
        "region": "Annapurna",
        "description": (
            "The Annapurna Circuit is one of the world's great long-distance treks, "
            "looping around the entire Annapurna massif through a stunning diversity of "
            "landscapes — subtropical valleys, alpine meadows, arid Tibetan plateaux, and "
            "the dramatic Thorong La pass (5,416 m). The route passes through dozens of "
            "Gurung, Manangi, and Thakali villages, each with its own distinct culture, "
            "cuisine, and architecture. A rewarding detour to the sacred Muktinath temple "
            "is almost obligatory."
        ),
        "highlights": (
            "Cross Thorong La pass (5,416 m) — the high point of the circuit\n"
            "Muktinath temple — sacred to both Hindus and Buddhists\n"
            "Manang village and the Gangapurna glacier lake\n"
            "Pisang and Braga — ancient cliff-hugging villages\n"
            "Tatopani hot springs after the long descent from Thorong La\n"
            "Poon Hill sunrise viewpoint (optional extension)"
        ),
        "distance_km": "160.00",
        "elevation_gain_m": 5200,
        "max_altitude_m": 5416,
        "duration_days": 16,
        "difficulty": "hard",
        "trek_style": "teahouse",
        "start_point": "Besisahar",
        "end_point": "Nayapul",
        "best_seasons": "Mar–May, Sep–Nov",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "28.545556",
        "longitude": "84.383333",
        "cover_image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "All passes open. Thorong La (5,416m) clear. Check forecasts before crossing — sudden snow possible Oct–Nov.",
        "condition_updated": "2026-04-20",
        "itinerary": [
            {"day": 1,  "title": "Kathmandu → Besisahar",       "description": "Drive or bus from Kathmandu to Besisahar, the circuit's start point.",                           "altitude_m": 760,  "walk_hours": 0.0},
            {"day": 2,  "title": "Besisahar → Bahundanda",      "description": "Enter the Marsyangdi valley — lush, warm, subtropical.",                                         "altitude_m": 1310, "walk_hours": 5.5},
            {"day": 3,  "title": "Bahundanda → Chamje",         "description": "Pass through Syange gorge with its dramatic waterfalls.",                                         "altitude_m": 1410, "walk_hours": 5.0},
            {"day": 4,  "title": "Chamje → Danaque / Bagarchhap","description": "Landscape shifts from subtropical to pine forest.",                                             "altitude_m": 2160, "walk_hours": 5.5},
            {"day": 5,  "title": "Bagarchhap → Chame",          "description": "Annapurna II appears as the valley narrows.",                                                    "altitude_m": 2710, "walk_hours": 5.0},
            {"day": 6,  "title": "Chame → Pisang",              "description": "Dramatic rock face — the Great Curve — and first views of Annapurna IV.",                        "altitude_m": 3300, "walk_hours": 5.5},
            {"day": 7,  "title": "Pisang → Manang",             "description": "Upper or lower route — both offer stunning Annapurna views. Manang is the acclimatisation hub.", "altitude_m": 3519, "walk_hours": 5.0},
            {"day": 8,  "title": "Manang — Acclimatise",        "description": "Rest day. Hike to Gangapurna lake or Ice Lake for altitude adaptation.",                         "altitude_m": 3519, "walk_hours": 3.5},
            {"day": 9,  "title": "Manang → Yak Kharka",         "description": "Ascend to higher grazing pastures above the tree line.",                                         "altitude_m": 4018, "walk_hours": 4.0},
            {"day": 10, "title": "Yak Kharka → Thorong Phedi",  "description": "Short walk to the base of the pass. Rest well — big day tomorrow.",                             "altitude_m": 4450, "walk_hours": 3.5},
            {"day": 11, "title": "Thorong La → Muktinath",      "description": "Pre-dawn start, cross Thorong La (5,416 m), descend to sacred Muktinath.",                      "altitude_m": 3800, "walk_hours": 8.0},
            {"day": 12, "title": "Muktinath → Marpha",          "description": "Descend through the windy Mustang rain shadow to the apple orchards of Marpha.",               "altitude_m": 2670, "walk_hours": 6.0},
            {"day": 13, "title": "Marpha → Ghasa",              "description": "Long descent through the Kali Gandaki gorge — deepest valley on Earth.",                        "altitude_m": 2010, "walk_hours": 6.5},
            {"day": 14, "title": "Ghasa → Tatopani",            "description": "Reach the hot springs at Tatopani — well earned.",                                              "altitude_m": 1190, "walk_hours": 5.5},
            {"day": 15, "title": "Tatopani → Ghorepani",        "description": "Steep climb through rhododendron forest to Ghorepani.",                                          "altitude_m": 2860, "walk_hours": 6.0},
            {"day": 16, "title": "Ghorepani → Poon Hill → Nayapul", "description": "Pre-dawn hike to Poon Hill (3,210 m) for Dhaulagiri and Annapurna sunrise, then descend to Nayapul.", "altitude_m": 1070, "walk_hours": 7.0},
        ],
        "permits": [
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu (Pradarshani Marg); or ACAP checkpost",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
            {
                "name": "Annapurna Conservation Area Permit (ACAP)",
                "permit_type": "conservation",
                "cost_usd": 30.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu; or ACAP checkpost at Besisahar / Nayapul",
                "notes": "Funds conservation work in the Annapurna region. Valid for one entry.",
            },
        ],
        "teahouses": [
            {"name": "Yak & Yeti Lodge",      "location": "Manang",         "altitude_m": 3519, "price_usd_min": 8,  "price_usd_max": 20, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 7,  "notes": "One of the best-equipped lodges on the circuit."},
            {"name": "Thorong Peak Guest House","location": "Thorong Phedi", "altitude_m": 4450, "price_usd_min": 8,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 10, "notes": "Basic and cold — bring earplugs and a warm bag."},
            {"name": "Bob Marley Guest House", "location": "Muktinath",      "altitude_m": 3800, "price_usd_min": 8,  "price_usd_max": 18, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 11, "notes": "Popular stop post-pass. Good food."},
            {"name": "Hotel Marpha",           "location": "Marpha",         "altitude_m": 2670, "price_usd_min": 8,  "price_usd_max": 20, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 12, "notes": "Try the apple brandy — Marpha is famous for it."},
            {"name": "Deurali Guest House",    "location": "Tatopani",       "altitude_m": 1190, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 14, "notes": "Right next to the hot springs."},
        ],
    },

    # ── Langtang Valley ───────────────────────────────────────────────────────
    {
        "name": "Langtang Valley Trek",
        "slug": "langtang-valley",
        "region": "Langtang",
        "description": (
            "The Langtang Valley Trek is Nepal's most accessible alpine trek from Kathmandu, "
            "reaching a dramatic glacier valley in just a few days. Known as the 'valley of glaciers,' "
            "Langtang is flanked by Langtang Lirung (7,234 m) to the north and the Tibetan plateau "
            "beyond. The route passes through the rebuilt Langtang village — devastated by the 2015 "
            "earthquake and now a symbol of Tamang resilience — and climbs to the sacred Kyanjin Gompa "
            "and viewpoints above 5,000 m. Shorter and less crowded than EBC or the circuit, it's "
            "ideal for trekkers with limited time."
        ),
        "highlights": (
            "Langtang Lirung (7,234 m) towering directly over the valley\n"
            "Kyanjin Gompa — a working monastery at 3,870 m\n"
            "Tsergo Ri (4,984 m) — panoramic summit above the valley\n"
            "Langtang village rebuilt after the 2015 earthquake\n"
            "Fresh yak cheese at Kyanjin creamery\n"
            "Gosainkunda lake (optional 2-day extension)"
        ),
        "distance_km": "65.00",
        "elevation_gain_m": 2150,
        "max_altitude_m": 4984,
        "duration_days": 8,
        "difficulty": "moderate",
        "trek_style": "teahouse",
        "start_point": "Syabrubesi",
        "end_point": "Syabrubesi",
        "best_seasons": "Mar–May, Sep–Nov",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "28.211667",
        "longitude": "85.516667",
        "cover_image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Trail fully open. River levels normal. Langtang village reconstruction ongoing but lodges operational.",
        "condition_updated": "2026-04-18",
        "itinerary": [
            {"day": 1, "title": "Kathmandu → Syabrubesi",        "description": "7-hour drive (or morning bus) from Kathmandu through Trishuli valley to the trailhead.",         "altitude_m": 1503, "walk_hours": 0.0},
            {"day": 2, "title": "Syabrubesi → Lama Hotel",       "description": "Steep climb through bamboo and rhododendron forest above the Langtang Khola.",                  "altitude_m": 2470, "walk_hours": 5.5},
            {"day": 3, "title": "Lama Hotel → Langtang Village", "description": "Valley opens up, first views of the giants. Pass through rebuilt Langtang village.",            "altitude_m": 3430, "walk_hours": 5.5},
            {"day": 4, "title": "Langtang → Kyanjin Gompa",      "description": "Short walk to the monastery and cheese factory at the head of the valley.",                     "altitude_m": 3870, "walk_hours": 2.5},
            {"day": 5, "title": "Kyanjin — Acclimatise / Tsergo Ri","description": "Ambitious trekkers push up Tsergo Ri (4,984 m) for a 360° panorama. Or rest at Kyanjin.", "altitude_m": 4984, "walk_hours": 6.0},
            {"day": 6, "title": "Kyanjin → Lama Hotel",          "description": "Descend quickly through the valley.",                                                           "altitude_m": 2470, "walk_hours": 5.0},
            {"day": 7, "title": "Lama Hotel → Syabrubesi",       "description": "Back down to the trailhead.",                                                                   "altitude_m": 1503, "walk_hours": 4.5},
            {"day": 8, "title": "Syabrubesi → Kathmandu",        "description": "Drive back to Kathmandu.",                                                                      "altitude_m": 1400, "walk_hours": 0.0},
        ],
        "permits": [
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu (Pradarshani Marg)",
                "notes": "Individual trekkers $20.",
            },
            {
                "name": "Langtang National Park Entry",
                "permit_type": "national_park",
                "cost_usd": 30.00,
                "where_to_buy": "Langtang National Park office, Kathmandu; or the park gate at Syabrubesi",
                "notes": "Includes entry to the Gosainkunda area if you extend your trek.",
            },
        ],
        "teahouses": [
            {"name": "Riverside Lodge",    "location": "Lama Hotel",       "altitude_m": 2470, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 2, "notes": "Basic but friendly. Solar power so charge devices in the evening."},
            {"name": "Namaste Guest House","location": "Langtang Village", "altitude_m": 3430, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 3, "notes": "Rebuilt after 2015. Run by local Tamang families."},
            {"name": "Kyanjin Guest House","location": "Kyanjin Gompa",    "altitude_m": 3870, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 4, "notes": "Try the yak cheese from the creamery nearby."},
        ],
    },

    # ── Manaslu Circuit ───────────────────────────────────────────────────────
    {
        "name": "Manaslu Circuit Trek",
        "slug": "manaslu-circuit",
        "region": "Manaslu",
        "description": (
            "The Manaslu Circuit is Nepal's great undiscovered long-distance route, "
            "circling the world's eighth-highest mountain (8,163 m) through some of "
            "the most remote and culturally intact Himalayan villages. The trail "
            "follows the Budhi Gandaki river gorge northward through subtropical "
            "forest and bamboo, ascending to Tibetan Plateau-like landscapes at "
            "Samagaon and Samdo before the dramatic single-day crossing of Larkya La "
            "(5,160 m). A restricted area permit keeps visitor numbers low — this "
            "feels like the Annapurna Circuit did thirty years ago."
        ),
        "highlights": (
            "Larkya La pass (5,160 m) — full-day crossing of the main Himalayan divide\n"
            "Samagaon village — Tibetan culture and monasteries at 3,520 m\n"
            "Manaslu Base Camp side-trip from Samagaon\n"
            "Budhi Gandaki gorge — dramatic cliffs and hanging bridges\n"
            "Birendra Tal glacial lake near Samdo\n"
            "Remote trail with far fewer trekkers than Everest or Annapurna"
        ),
        "distance_km": "177.00",
        "elevation_gain_m": 5700,
        "max_altitude_m": 5160,
        "duration_days": 14,
        "difficulty": "hard",
        "trek_style": "teahouse",
        "start_point": "Soti Khola",
        "end_point": "Dharapani",
        "best_seasons": "Mar–May, Sep–Nov",
        "permits_required": True,
        "guide_required": True,
        "is_published": True,
        "latitude": "28.546111",
        "longitude": "84.559722",
        "cover_image_url": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Larkya La open. Confirm pass conditions with your guide before departure — overnight snow can close it even mid-season.",
        "condition_updated": "2026-04-20",
        "itinerary": [
            {"day": 1,  "title": "Kathmandu → Soti Khola",            "description": "Long drive (8–10 hrs) via Arughat to the trailhead at Soti Khola on the Budhi Gandaki.",         "altitude_m": 730,  "walk_hours": 0.0},
            {"day": 2,  "title": "Soti Khola → Machha Khola",         "description": "Enter the Budhi Gandaki gorge on a narrow trail with several suspension bridges.",              "altitude_m": 930,  "walk_hours": 5.5},
            {"day": 3,  "title": "Machha Khola → Jagat",              "description": "Subtropical forest gives way to higher scrub. Jagat is the restricted area permit checkpoint.", "altitude_m": 1340, "walk_hours": 6.5},
            {"day": 4,  "title": "Jagat → Deng",                      "description": "The gorge deepens — waterfalls, cliffs, and hanging bridges.",                                   "altitude_m": 1860, "walk_hours": 6.0},
            {"day": 5,  "title": "Deng → Namrung",                    "description": "Vegetation shifts to pine and juniper. First views of Himalayan peaks ahead.",                  "altitude_m": 2630, "walk_hours": 6.0},
            {"day": 6,  "title": "Namrung → Samagaon",                "description": "Landscape turns Tibetan — mani walls, chortens, flat-roofed stone houses, yak herds.",        "altitude_m": 3519, "walk_hours": 6.5},
            {"day": 7,  "title": "Samagaon — Acclimatise",            "description": "Rest day. Optional hike toward Manaslu Base Camp (4,800 m) or Pungen Glacier for views.",     "altitude_m": 3519, "walk_hours": 4.0},
            {"day": 8,  "title": "Samagaon → Samdo",                  "description": "Short walk to the high Tibetan settlement of Samdo. Visit Birendra Tal glacial lake.",         "altitude_m": 3860, "walk_hours": 3.5},
            {"day": 9,  "title": "Samdo → Dharamsala (high camp)",    "description": "Climb to the basic high camp shelters below Larkya La. Early night — big day tomorrow.",      "altitude_m": 4460, "walk_hours": 4.0},
            {"day": 10, "title": "Larkya La → Bimthang",              "description": "Pre-dawn start, cross Larkya La (5,160 m), then long descent through moraine to green Bimthang.", "altitude_m": 3720, "walk_hours": 9.0},
            {"day": 11, "title": "Bimthang → Tilije",                 "description": "Descend through apple orchards and oak forest. Manaslu still visible behind.",                "altitude_m": 2300, "walk_hours": 5.5},
            {"day": 12, "title": "Tilije → Dharapani",                "description": "Join the Annapurna Circuit trail at Dharapani on the Marsyangdi river.",                      "altitude_m": 1860, "walk_hours": 4.0},
            {"day": 13, "title": "Dharapani → Besisahar (drive)",     "description": "Jeep or local bus down the Marsyangdi valley to Besisahar.",                                  "altitude_m": 760,  "walk_hours": 0.0},
            {"day": 14, "title": "Besisahar → Kathmandu (drive)",     "description": "Drive or bus back to Kathmandu — approximately 6 hours.",                                     "altitude_m": 1400, "walk_hours": 0.0},
        ],
        "permits": [
            {
                "name": "Manaslu Restricted Area Permit",
                "permit_type": "restricted_area",
                "cost_usd": 100.00,
                "where_to_buy": "Department of Immigration, Kathmandu (Kalikasthan)",
                "notes": "USD 100 per week (Sep–Nov & Mar–May); USD 75/week (Dec–Feb). Minimum 2 trekkers + licensed guide mandatory.",
            },
            {
                "name": "Manaslu Conservation Area Permit (MCAP)",
                "permit_type": "conservation",
                "cost_usd": 30.00,
                "where_to_buy": "Nepal Tourism Board, Kathmandu; or MCAP checkpost at Jagat",
                "notes": "Required in addition to the Restricted Area Permit. Covers the Manaslu Conservation Area.",
            },
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu (Pradarshani Marg)",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
        ],
        "teahouses": [
            {"name": "Lhasa Guest House",   "location": "Jagat",      "altitude_m": 1340, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 3,  "notes": "One of the better lodges on the lower Budhi Gandaki. Friendly family."},
            {"name": "Manaslu Hotel",       "location": "Namrung",    "altitude_m": 2630, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 5,  "notes": "Basic but warm. Good dal bhat and tongba millet beer."},
            {"name": "Sama Guest House",    "location": "Samagaon",   "altitude_m": 3519, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 6,  "notes": "Best lodge in Samagaon. Rooftop views of Manaslu at sunrise."},
            {"name": "Snow Lion Lodge",     "location": "Samdo",      "altitude_m": 3860, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 8,  "notes": "Only a handful of lodges — reserve ahead if travelling with a group."},
            {"name": "Dharamsala Shelter",  "location": "Dharamsala", "altitude_m": 4460, "price_usd_min": 5,  "price_usd_max": 10, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 9,  "notes": "Very basic stone huts. Blankets provided but a good sleeping bag is essential."},
            {"name": "Himalayan Lodge",     "location": "Bimthang",   "altitude_m": 3720, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 10, "notes": "Welcome sight after the pass crossing. Dal bhat and hot tea."},
        ],
    },

    # ── Upper Mustang ─────────────────────────────────────────────────────────
    {
        "name": "Upper Mustang Trek",
        "slug": "upper-mustang",
        "region": "Mustang",
        "description": (
            "Upper Mustang is Nepal's last forbidden kingdom — a restricted high-altitude "
            "desert enclosed by the rain shadow of the Annapurna and Dhaulagiri ranges. "
            "The landscape is lunar and strikingly un-Nepali: eroded red-ochre cliffs, "
            "ancient cave dwellings, and whitewashed villages that look more Tibetan than "
            "South Asian. The destination is Lo Manthang, the medieval walled capital of "
            "the former Kingdom of Lo, whose 15th-century royal palace and monasteries are "
            "among the best-preserved in the Tibetan cultural world. The permit fee is high, "
            "the experience is extraordinary."
        ),
        "highlights": (
            "Lo Manthang — medieval walled capital of the ancient Kingdom of Lo\n"
            "Choser cave complex — Buddhist cave monasteries carved into cliffs\n"
            "Kali Gandaki river valley — deepest gorge on Earth\n"
            "Sky caves of Mustang — thousands of man-made cliff dwellings\n"
            "Lo Gekar monastery — one of the oldest in Nepal (8th century)\n"
            "Tibetan plateau landscape unique in Nepal"
        ),
        "distance_km": "120.00",
        "elevation_gain_m": 2200,
        "max_altitude_m": 3840,
        "duration_days": 10,
        "difficulty": "moderate",
        "trek_style": "teahouse",
        "start_point": "Jomsom",
        "end_point": "Jomsom",
        "best_seasons": "May–Oct",
        "permits_required": True,
        "guide_required": True,
        "is_published": True,
        "latitude": "29.180556",
        "longitude": "83.958333",
        "cover_image_url": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Trail open May–Oct. Roads from Jomsom to Kagbeni now jeep-accessible — confirm trail vs road with operator.",
        "condition_updated": "2026-05-01",
        "itinerary": [
            {"day": 1,  "title": "Pokhara → Jomsom (fly) → Kagbeni",   "description": "Morning flight to Jomsom (2,720 m), then walk north along the Kali Gandaki to Kagbeni.", "altitude_m": 2810, "walk_hours": 2.5},
            {"day": 2,  "title": "Kagbeni → Chele",                     "description": "Enter the Upper Mustang restricted area. Trail climbs through red-rock canyons.",         "altitude_m": 3050, "walk_hours": 5.0},
            {"day": 3,  "title": "Chele → Syangboche",                  "description": "Cross two passes — Taklam La and Dajori La — with sweeping plateau views.",              "altitude_m": 3800, "walk_hours": 6.0},
            {"day": 4,  "title": "Syangboche → Ghemi",                  "description": "Pass the longest mani wall in Nepal and descend to the whitewashed village of Ghemi.",   "altitude_m": 3520, "walk_hours": 5.5},
            {"day": 5,  "title": "Ghemi → Tsarang",                     "description": "Climb to Nyi La pass (4,010 m) with Nilgiri, Tilicho, and Damodar views. Tsarang monastery.", "altitude_m": 3620, "walk_hours": 5.0},
            {"day": 6,  "title": "Tsarang → Lo Manthang",               "description": "Arrive at the ancient walled capital of Lo. Enter through the main gate.",              "altitude_m": 3840, "walk_hours": 4.5},
            {"day": 7,  "title": "Lo Manthang — Explore",               "description": "Full day: royal palace, Jampa Lhakhang (15th-century), Choser caves side-trip.",         "altitude_m": 3840, "walk_hours": 3.0},
            {"day": 8,  "title": "Lo Manthang → Ghami",                 "description": "Begin the return south, detouring via Lo Gekar monastery (8th century).",                "altitude_m": 3520, "walk_hours": 5.5},
            {"day": 9,  "title": "Ghami → Chele → Kagbeni",             "description": "Long but straightforward descent back to Kagbeni on the Kali Gandaki.",                 "altitude_m": 2810, "walk_hours": 7.0},
            {"day": 10, "title": "Kagbeni → Jomsom → Pokhara (fly)",    "description": "Walk back to Jomsom and take the morning flight to Pokhara.",                            "altitude_m": 820,  "walk_hours": 2.0},
        ],
        "permits": [
            {
                "name": "Upper Mustang Restricted Area Permit",
                "permit_type": "restricted_area",
                "cost_usd": 500.00,
                "where_to_buy": "Department of Immigration, Kathmandu (Kalikasthan)",
                "notes": "USD 500 for 10 days; USD 50 per additional day. Minimum 2 trekkers + licensed guide mandatory. Most expensive trekking permit in Nepal.",
            },
            {
                "name": "Annapurna Conservation Area Permit (ACAP)",
                "permit_type": "conservation",
                "cost_usd": 30.00,
                "where_to_buy": "Nepal Tourism Board, Kathmandu; or ACAP checkpost at Jomsom",
                "notes": "Required in addition to the Restricted Area Permit.",
            },
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu (Pradarshani Marg)",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
        ],
        "teahouses": [
            {"name": "Red House Lodge",       "location": "Kagbeni",     "altitude_m": 2810, "price_usd_min": 8,  "price_usd_max": 20, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 1,  "notes": "One of the best lodges in Kagbeni — good food and views of the gateway village."},
            {"name": "Himalayan Guest House", "location": "Chele",       "altitude_m": 3050, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 2,  "notes": "Basic but adequate. Wind can be fierce — keep doors closed."},
            {"name": "Mustang Holiday Inn",   "location": "Ghemi",       "altitude_m": 3520, "price_usd_min": 8,  "price_usd_max": 18, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 4,  "notes": "Good Thakali food. Warm common room."},
            {"name": "Lo Manthang Hotel",     "location": "Lo Manthang", "altitude_m": 3840, "price_usd_min": 10, "price_usd_max": 25, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 6,  "notes": "Nicest lodge in the walled city. Try the yak meat curry."},
        ],
    },

    # ── Poon Hill ─────────────────────────────────────────────────────────────
    {
        "name": "Ghorepani Poon Hill Trek",
        "slug": "poon-hill",
        "region": "Annapurna",
        "description": (
            "The Ghorepani Poon Hill Trek is Nepal's most popular short trek and the "
            "perfect introduction to Himalayan trekking. It climbs through terraced rice "
            "paddies and dense rhododendron forest — ablaze with pink and red blooms in "
            "March and April — to the viewpoint of Poon Hill (3,210 m), where a pre-dawn "
            "hike rewards you with a panorama of ten Himalayan peaks including Dhaulagiri "
            "(8,167 m) and Annapurna South. Doable in 4–5 days, accessible from Pokhara, "
            "and suitable for trekkers of all fitness levels."
        ),
        "highlights": (
            "Poon Hill sunrise (3,210 m) — Dhaulagiri and Annapurna in one sweep\n"
            "Rhododendron forests in full bloom (March–April)\n"
            "Gurung and Magar village culture in Ghandruk\n"
            "Terraced hillside landscapes above Pokhara\n"
            "Tadapani — peaceful forest camp between ridges\n"
            "Short enough for a long weekend from Kathmandu"
        ),
        "distance_km": "48.00",
        "elevation_gain_m": 1600,
        "max_altitude_m": 3210,
        "duration_days": 5,
        "difficulty": "easy",
        "trek_style": "teahouse",
        "start_point": "Nayapul",
        "end_point": "Nayapul",
        "best_seasons": "Oct–May",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "28.400000",
        "longitude": "83.716667",
        "cover_image_url": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Trail open year-round. Rhododendrons peak mid-March to mid-April. Avoid monsoon (Jun–Aug) for leeches and mud.",
        "condition_updated": "2026-05-01",
        "itinerary": [
            {"day": 1, "title": "Pokhara → Nayapul → Tikhedhunga", "description": "1-hour drive from Pokhara to Nayapul, then walk up the Bhurungdi Khola valley.",             "altitude_m": 1540, "walk_hours": 3.5},
            {"day": 2, "title": "Tikhedhunga → Ghorepani",          "description": "Steep stone-stepped climb through rhododendron and oak forest to the ridge at Ghorepani.", "altitude_m": 2860, "walk_hours": 5.5},
            {"day": 3, "title": "Poon Hill sunrise → Tadapani",     "description": "Pre-dawn hike to Poon Hill for sunrise. Descend and continue through forest to Tadapani.",  "altitude_m": 2630, "walk_hours": 6.0},
            {"day": 4, "title": "Tadapani → Ghandruk",              "description": "Descend through mossy forest to the large Gurung village of Ghandruk with Annapurna views.","altitude_m": 1940, "walk_hours": 4.0},
            {"day": 5, "title": "Ghandruk → Nayapul → Pokhara",    "description": "Descend through terraced fields to Nayapul, then drive back to Pokhara.",                   "altitude_m": 820,  "walk_hours": 3.5},
        ],
        "permits": [
            {
                "name": "Annapurna Conservation Area Permit (ACAP)",
                "permit_type": "conservation",
                "cost_usd": 30.00,
                "where_to_buy": "Nepal Tourism Board, Kathmandu; or ACAP office, Pokhara (Damside/Lakeside); or the checkpost at Nayapul",
                "notes": "Valid for one entry into the Annapurna Conservation Area.",
            },
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu or Pokhara",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
        ],
        "teahouses": [
            {"name": "Hotel Forest Shade",   "location": "Tikhedhunga", "altitude_m": 1540, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": True,  "day_on_trail": 1, "notes": "Comfortable first-night stop. Warm showers and good dal bhat."},
            {"name": "Deurali Inn",          "location": "Ghorepani",   "altitude_m": 2860, "price_usd_min": 6,  "price_usd_max": 18, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 2, "notes": "One of the most popular lodges. Book ahead Oct–Nov."},
            {"name": "Rhododendron Lodge",   "location": "Tadapani",    "altitude_m": 2630, "price_usd_min": 5,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 3, "notes": "Quiet forest setting. Good apple pie."},
            {"name": "Himalayan Lodge",      "location": "Ghandruk",    "altitude_m": 1940, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 4, "notes": "Gurung-run lodge with a terrace facing Annapurna South. Great views."},
        ],
    },

    # ── Mardi Himal ───────────────────────────────────────────────────────────
    {
        "name": "Mardi Himal Trek",
        "slug": "mardi-himal",
        "region": "Annapurna",
        "description": (
            "The Mardi Himal Trek opened as an official trekking route in 2012 and "
            "has quickly become one of Nepal's most talked-about short treks. The "
            "trail climbs the eastern ridge of the Mardi Himal massif through layered "
            "rhododendron forest to an open high-altitude ridge walk with staggeringly "
            "close views of Mardi Himal, Machhapuchhre (Fishtail), and Annapurna South. "
            "The route starts and ends at Pokhara, requires no technical gear, and "
            "receives far fewer visitors than the classic Annapurna trails — making it "
            "one of Nepal's best-value week-long treks."
        ),
        "highlights": (
            "Machhapuchhre (Fishtail Peak) seen at arm's length from High Camp\n"
            "Annapurna South and Hiunchuli filling the sky above the ridge\n"
            "Mardi Himal Base Camp (4,500 m) with 270° Himalayan panorama\n"
            "Dense rhododendron forest in the middle section\n"
            "Australian Camp — sweeping evening views of the Annapurna range\n"
            "Far fewer trekkers than other Annapurna routes"
        ),
        "distance_km": "52.00",
        "elevation_gain_m": 2600,
        "max_altitude_m": 4500,
        "duration_days": 7,
        "difficulty": "moderate",
        "trek_style": "teahouse",
        "start_point": "Kande",
        "end_point": "Siding",
        "best_seasons": "Oct–Nov, Mar–May",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "28.478333",
        "longitude": "84.038333",
        "cover_image_url": "https://images.unsplash.com/photo-1625134673337-519d4d10b313?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Trail open. High Camp and Base Camp accessible. Some snow patches above 3,800 m — microspikes useful Oct–Nov.",
        "condition_updated": "2026-04-28",
        "itinerary": [
            {"day": 1, "title": "Pokhara → Kande → Australian Camp",  "description": "Drive from Pokhara to Kande (1,770 m), then hike up through terraced fields to Australian Camp.", "altitude_m": 2060, "walk_hours": 3.0},
            {"day": 2, "title": "Australian Camp → Forest Camp",       "description": "Enter thick rhododendron forest on a well-marked ridge trail.",                                     "altitude_m": 2600, "walk_hours": 4.0},
            {"day": 3, "title": "Forest Camp → Low Camp",              "description": "Continue up the ridge. Forest begins to thin; first Annapurna views appear.",                        "altitude_m": 3050, "walk_hours": 4.5},
            {"day": 4, "title": "Low Camp → High Camp",                "description": "Trail emerges from tree line. Machhapuchhre dominates. High Camp is on the open ridge.",            "altitude_m": 3580, "walk_hours": 4.5},
            {"day": 5, "title": "High Camp → Mardi Himal Base Camp → High Camp", "description": "Early start up the ridge to Base Camp (4,500 m) for sunrise on the massif. Return to High Camp.", "altitude_m": 3580, "walk_hours": 5.5},
            {"day": 6, "title": "High Camp → Siding Village",          "description": "Descend the east ridge through rhododendron to the quiet Gurung village of Siding.",                "altitude_m": 1750, "walk_hours": 6.0},
            {"day": 7, "title": "Siding → Lumre → Pokhara",            "description": "Walk or jeep to Lumre on the Pokhara–Beni highway, then drive to Pokhara.",                        "altitude_m": 820,  "walk_hours": 2.0},
        ],
        "permits": [
            {
                "name": "Annapurna Conservation Area Permit (ACAP)",
                "permit_type": "conservation",
                "cost_usd": 30.00,
                "where_to_buy": "Nepal Tourism Board or ACAP office, Pokhara (Lakeside / Damside)",
                "notes": "Same permit covers all Annapurna Conservation Area treks including Poon Hill and Mardi Himal.",
            },
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Pokhara",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
        ],
        "teahouses": [
            {"name": "Australian Camp Lodge",  "location": "Australian Camp", "altitude_m": 2060, "price_usd_min": 5,  "price_usd_max": 15, "has_wifi": True,  "has_hot_shower": True,  "day_on_trail": 1, "notes": "Best sunset views of the Annapurna range. Popular with day-trippers from Pokhara."},
            {"name": "Forest Camp Lodge",      "location": "Forest Camp",     "altitude_m": 2600, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 2, "notes": "Simple lodge surrounded by rhododendrons. Peaceful and quiet."},
            {"name": "Low Camp Teahouse",      "location": "Low Camp",        "altitude_m": 3050, "price_usd_min": 5,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 3, "notes": "Good acclimatisation stop. Cook here charges by item — budget accordingly."},
            {"name": "High Camp Lodge",        "location": "High Camp",       "altitude_m": 3580, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 4, "notes": "Exposed ridge location — wind can be strong. Best Machhapuchhre sunrise in Nepal."},
        ],
    },

    # ── Gokyo Lakes ───────────────────────────────────────────────────────────
    {
        "name": "Gokyo Lakes Trek",
        "slug": "gokyo-lakes",
        "region": "Khumbu",
        "description": (
            "The Gokyo Lakes Trek is the quieter, arguably more beautiful alternative to "
            "the standard Everest Base Camp route. It takes you to a chain of sacred turquoise "
            "glacial lakes at 4,700–5,000 m, crowned by the Gokyo Ri viewpoint (5,357 m) "
            "offering one of the finest panoramas in the Himalayas — four 8,000 m peaks "
            "visible in a single sweep: Everest, Lhotse, Makalu, and Cho Oyu. The optional "
            "Cho La pass crossing (5,420 m) links it back to the EBC trail for an outstanding "
            "combined circuit."
        ),
        "highlights": (
            "Gokyo Ri (5,357 m) — Everest, Lhotse, Makalu, and Cho Oyu in one panorama\n"
            "Ngozumpa Glacier — Nepal's longest glacier\n"
            "Five sacred Gokyo lakes strung along the glacier edge\n"
            "Gokyo village — far fewer crowds than the EBC trail\n"
            "Cho La pass (5,420 m) — optional crossing to the EBC circuit\n"
            "Renjo La (5,360 m) — another stunning pass option"
        ),
        "distance_km": "110.00",
        "elevation_gain_m": 3600,
        "max_altitude_m": 5357,
        "duration_days": 12,
        "difficulty": "hard",
        "trek_style": "teahouse",
        "start_point": "Lukla",
        "end_point": "Lukla",
        "best_seasons": "Mar–May, Sep–Dec",
        "permits_required": True,
        "guide_required": False,
        "is_published": True,
        "latitude": "27.951389",
        "longitude": "86.699722",
        "cover_image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80&auto=format&fit=crop",
        "condition_status": "open",
        "condition_notes": "Gokyo trail open. Lakes unfrozen. Cho La pass suitable for experienced trekkers with microspikes.",
        "condition_updated": "2026-04-22",
        "itinerary": [
            {"day": 1,  "title": "Lukla → Phakding",             "description": "Fly into Lukla (2,860 m) and descend to Phakding.",                                                         "altitude_m": 2652, "walk_hours": 3.5},
            {"day": 2,  "title": "Phakding → Namche Bazaar",     "description": "Cross the Hillary Bridge and climb to the Sherpa capital.",                                                  "altitude_m": 3440, "walk_hours": 5.5},
            {"day": 3,  "title": "Namche — Acclimatise",         "description": "Rest day. Hike to the Everest View Hotel ridge.",                                                            "altitude_m": 3440, "walk_hours": 3.0},
            {"day": 4,  "title": "Namche → Dole",                "description": "Branch off the EBC trail onto the Gokyo route. Steep climb through yak pastures.",                          "altitude_m": 4038, "walk_hours": 5.5},
            {"day": 5,  "title": "Dole → Machhermo",             "description": "Continue up the Dudh Koshi valley with views of Cho Oyu ahead.",                                            "altitude_m": 4470, "walk_hours": 4.5},
            {"day": 6,  "title": "Machhermo → Gokyo",            "description": "Pass the first and second Gokyo lakes before reaching the third and largest lake at Gokyo.",               "altitude_m": 4790, "walk_hours": 5.0},
            {"day": 7,  "title": "Gokyo Ri — Summit Day",        "description": "Pre-dawn ascent of Gokyo Ri (5,357 m). Arguably Nepal's finest viewpoint. Rest afternoon.",               "altitude_m": 5357, "walk_hours": 5.0},
            {"day": 8,  "title": "Gokyo → Cho La Base",          "description": "Descend to Dragnag, preparing for the Cho La crossing. (Skip if avoiding the pass.)",                     "altitude_m": 4700, "walk_hours": 4.5},
            {"day": 9,  "title": "Cho La → Lobuche",             "description": "Cross the Cho La glacier pass (5,420 m) and descend to Lobuche. Technical but non-roped.",                "altitude_m": 4940, "walk_hours": 7.0},
            {"day": 10, "title": "Lobuche → Namche Bazaar",      "description": "Descend through Dingboche and Tengboche back to Namche.",                                                   "altitude_m": 3440, "walk_hours": 8.0},
            {"day": 11, "title": "Namche → Lukla",               "description": "Final descent through the Dudh Koshi valley.",                                                              "altitude_m": 2860, "walk_hours": 6.5},
            {"day": 12, "title": "Lukla → Kathmandu (fly)",      "description": "Morning flight back to Kathmandu.",                                                                         "altitude_m": 1400, "walk_hours": 0.0},
        ],
        "permits": [
            {
                "name": "TIMS Card",
                "permit_type": "tims",
                "cost_usd": 20.00,
                "where_to_buy": "Nepal Tourism Board office, Kathmandu",
                "notes": "Individual trekkers $20; guided trekkers $10.",
            },
            {
                "name": "Sagarmatha National Park Entry",
                "permit_type": "national_park",
                "cost_usd": 30.00,
                "where_to_buy": "Department of National Parks, Kathmandu; or park gate at Monjo",
                "notes": "Same permit as the EBC route — covers the full Khumbu region.",
            },
            {
                "name": "Khumbu Pasang Lhamu Municipality Entry",
                "permit_type": "municipal",
                "cost_usd": 20.00,
                "where_to_buy": "Collected at checkpoints in Khumbu region",
                "notes": "Introduced in 2021. Fee goes to local infrastructure.",
            },
        ],
        "teahouses": [
            {"name": "Dole Guest House",      "location": "Dole",       "altitude_m": 4038, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 4, "notes": "Small settlement — limited options. Book ahead in peak season."},
            {"name": "Machhermo Hotel",       "location": "Machhermo",  "altitude_m": 4470, "price_usd_min": 6,  "price_usd_max": 15, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 5, "notes": "Decent food. Popular with groups heading to Gokyo."},
            {"name": "Gokyo Resort",          "location": "Gokyo",      "altitude_m": 4790, "price_usd_min": 10, "price_usd_max": 25, "has_wifi": True,  "has_hot_shower": False, "day_on_trail": 6, "notes": "Best views in the village. Book ahead — fills up fast."},
            {"name": "Dragnag Guest House",   "location": "Dragnag",    "altitude_m": 4700, "price_usd_min": 6,  "price_usd_max": 12, "has_wifi": False, "has_hot_shower": False, "day_on_trail": 8, "notes": "Very basic. Last stop before the Cho La crossing."},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed all trails with itineraries, permits, and teahouses"

    def handle(self, *args, **kwargs):
        for data in TRAILS:
            itinerary_data = data.pop("itinerary")
            permits_data   = data.pop("permits")
            teahouses_data = data.pop("teahouses")

            trail, created = Trail.objects.update_or_create(
                slug=data["slug"],
                defaults=data,
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"{action} trail: {trail.name}")

            # Wipe and re-seed related records so we can re-run safely
            trail.itinerary.all().delete()
            for day_data in itinerary_data:
                Itinerary.objects.create(trail=trail, **day_data)

            trail.permits.all().delete()
            for p in permits_data:
                Permit.objects.create(trail=trail, **p)

            trail.teahouses.all().delete()
            for t in teahouses_data:
                Teahouse.objects.create(trail=trail, **t)

            self.stdout.write(
                f"  → {len(itinerary_data)} days, {len(permits_data)} permits, {len(teahouses_data)} teahouses"
            )

        self.stdout.write(self.style.SUCCESS(f"\nDone — {len(TRAILS)} trails seeded."))

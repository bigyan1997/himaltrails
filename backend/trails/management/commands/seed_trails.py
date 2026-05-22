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
        "cover_image_url": "https://images.unsplash.com/photo-1605367283286-fb8dbe3406e3?w=1200&q=80&auto=format&fit=crop",
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

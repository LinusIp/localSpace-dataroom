# localSpace investor data room: content

This file holds every word and number for the investor page. The numbers in `data/*.json` are the same numbers in machine form. Use them as given. Don't round differently and don't invent new ones.

Last updated: 24 October 2026.

---

## 0. Hero

- Name: **localSpace**
- One line: **Private AI that runs on your own computer.**
- Under it: Offline. On the laptop or server you already have. Built in Uzbekistan for everyone.
- Stage chip: **Pre-seed · raising $25,000 · October 2026**
- Buttons:
  - "Download the preview": https://linusip.github.io/localLabs/
  - "Join the community": https://t.me/localSpace_discussion
  - "Contact": mailto:locallabs.io@gmail.com

## 1. Snapshot (four big numbers)

| Number | Label |
|---|---|
| Live | Public preview, free to download (October 2026) |
| 10+ | Testers on their own laptops |
| ~19 | Words a second on a 4 GB laptop graphics card (25 tokens a second, measured) |
| ~5 | Words a second with no graphics card and 8 GB of memory (6–7 tokens a second, measured) |

Small note under the numbers: Speeds were measured with Qwen3.5 4B, October 2026. One token is about three quarters of an English word.

## 2. Problem

People want AI, but:

1. **Data can't leave the country.** Banks, clinics and offices can't send personal data to foreign clouds. Uzbekistan's personal-data law (amended by Law ZRU-666, in force 15 April 2021) requires citizens' data to be kept on servers inside the country. Nearly 60% of AI leaders cite cross-border data rules as a major challenge (NTT DATA, May 2026).
2. **Cloud AI is expensive.** $20–30 per person every month: ChatGPT Business and Claude Team cost $20 billed yearly, and Microsoft 365 Copilot costs $18–30 on top of a Microsoft 365 licence.
3. **Local AI is for experts.** Free tools exist, but people must know which model their computer can run and how to set it up.

Result line: **So people risk their data, overpay, or go without AI.**

## 3. Solution: what localSpace is

One app. Private AI on the computer you have.

- **Runs on any mid-range computer.** It checks the machine and picks the model that runs well on it.
- **Private and offline.** Nothing you type leaves the computer. No account needed.
- **From laptop to company server.** Free for people; companies run it on their own server.

What works in the public preview today:
- chat with open models from several makers (Qwen3.5, Gemma 4, Ministral), from 0.8B to 9B, chosen to fit the computer;
- automatic model choice for the computer;
- attaching pictures and screenshots;
- English, Russian and Uzbek;
- any graphics card (NVIDIA, AMD or Intel, through Vulkan) or none;
- chats kept when updating.

Coming next:
- **0.2.0, November 2026:** text-file attachments.
- **0.2.1:**
  - context compacting for long chats;
  - PDF and Word files;
  - full app translation;
  - bring your own model: any open GGUF model from Hugging Face, up to 122B on big machines;
  - a new design with three colour themes;
  - a CUDA edition for NVIDIA, if the licence review is cleared.
- **2027:**
  - the AI agent that works with your files and tools offline;
  - an SDK so companies and the community can add their own tools (community tools are reviewed before they enter the catalog);
  - the company server edition.

Our focus: **AI agents where everything stays with you.** One engine, easy to extend with your own tools, the way people use cloud assistants today, but local.

## 4. Advantage

Columns: localSpace, Ollama, LM Studio, ChatGPT / Claude. Marks: yes, partly (with extra setup), no.

| Row | localSpace | Ollama | LM Studio | ChatGPT / Claude |
|---|---|---|---|---|
| Everything stays on your computer | yes | yes | yes | no |
| Easy for anyone: picks the right AI for your computer | yes | no | partly | yes |
| AI agent that does tasks with your files, offline | yes* | no | partly | no |
| Easy to add your own tools | yes* | no | partly | partly |
| Company server, installed and supported for you | yes* | partly | no | no |

\* Show a small footnote under the table: "In development; planned for 2027. The public preview has chat, pictures and model choice." The founder chose ticks on the deck. The page is a permanent public document, so it carries this footnote, and the page must never claim these features work today.

## 5. Proof: tested on real hardware

- **Test A, 22 September 2026:** 10+ people used the first version on their own gaming laptops. All their feedback was about chat basics (stop button, several chats at once, dark mode, attachments, maths symbols). Fixes went into 0.2.
- **Our 4 GB test laptop (RTX 3050 Ti), 24 October 2026:** Qwen3.5 4B read a photo of a handwritten integral and solved it correctly in English, Russian and Uzbek. It read the picture in about 17–18 seconds, then wrote at 25.1, 25.2 and 25.6 tokens a second (about 19 words a second). The Uzbek answer used one wrong term; we show it unedited on our site. Link: https://linusip.github.io/localLabs/
- **No graphics card, 20 October 2026:** a Core i7 laptop with Intel Iris Xe and 8 GB of memory ran Qwen3.5 4B at 6–7 tokens a second (about 5 words a second) with a browser and VS Code open.
- **Public preview, October 2026:** v0.2.0-preview.1 is public, with a download counter and a Telegram community.

## 6. Hardware: what it costs, how many people it serves, which models

**We don't limit people to a few models.** localSpace runs open models from many makers (Qwen, Gemma, Mistral, Llama, Phi, gpt-oss and more), from 1B to 122B parameters. Bring your own model (0.2.1) loads any open model in GGUF format from Hugging Face. The app checks the computer and picks the best model that fits.

Use `data/hardware.json`. Show two views.

**A. Which model sizes run on which machine** (a grid: machines × model classes, words a second in each cell; "—" = doesn't fit; small "slow" tag = part of the model in normal memory; "measured" badge on our own measurements):

| Model class | Examples | Quality |
|---|---|---|
| Tiny, 1–2B | Qwen3.5 0.8B and 2B, Gemma 4 E2B, Llama 3.2 1B | Basic: quick answers, simple tasks |
| Small, 3–4B | Qwen3.5 4B, Gemma 4 E4B, Phi-4-mini, Ministral 3B | Basic+: everyday chat, pictures |
| Medium, 7–9B | Qwen3.5 9B, Ministral 8B, Llama 3.1 8B | Good: everyday work, documents, pictures |
| Upper-medium, 12–14B | Ministral 14B, Phi-4 14B, Qwen3 14B | Good+: longer documents, better reasoning |
| Fast mixture-of-experts, 20–35B | gpt-oss-20b (13 GB), Gemma 4 26B-A4B (16–18 GB), Qwen3.5 35B-A3B (21 GB) | Strong: reasoning and tool use, fast |
| Large dense, 27–32B | Qwen3.5 27B, Gemma 4 31B, Qwen3 32B | Strong: hardest single-user tasks |
| Very large mixture-of-experts, 100–122B | gpt-oss-120b (61 GB), Qwen3.5 122B-A10B (72 GB), Mistral Small 4 119B | Very strong: closest to cloud assistants |

Grid values (words a second, from `data/hardware.json`; m = measured, s = slow):

| Machine | Price | Tiny | Small | Medium | Upper | MoE 20–35B | Dense 27–32B | MoE 100–122B |
|---|---|---|---|---|---|---|---|---|
| Office laptop, Iris Xe, 8 GB | $400–800 | 10 | 5 m | — | — | — | — | — |
| Our 4 GB gaming laptop (RTX 3050 Ti) | older | 36 | 19 m | 7 m | 2 s | — | — | — |
| Gaming laptop, RTX 5060 8 GB | $1,100–1,300 | 73 | 36 | 18 | 6 s | — | — | — |
| Office desktop, RTX 5060 Ti 16 GB | $1,700–2,000 | 112 | 56 | 27 | 19 | 22 s* | 5 s | — |
| Desktop, used RTX 3090 24 GB | $2,300–2,600 | 234 | 117 | 57 | 39 | 84 | 20 | — |
| Mini PC, Ryzen AI Max+ 395, 128 GB | $3,450–3,650 | 64 | 32 | 15 | 11 | 23 | 5 | 14 |
| NVIDIA DGX Spark, 128 GB | $6,950 | 68 | 34 | 17 | 11 | 25 | 6 | 15 |
| Workstation, RTX PRO 6000 96 GB | $13,000–19,000 | 448 | 224 | 108 | 75 | 161 | 37 | 101 |

\* On the 16 GB desktop, gpt-oss-20b (13 GB) fits fully and runs at about 50 words a second. The larger models in that class are the "slow" ones.

**B. How many people one machine serves** (company servers):

| Machine | Model class | Chats at once | Team it serves | Price per person served |
|---|---|---|---|---|
| Office desktop, RTX 5060 Ti 16 GB (default) | Medium 7–9B | 6 | 18–30 | about $77 |
| Desktop, used RTX 3090 24 GB (best value) | Medium 7–9B | 12 | 36–60 | about $51 |
| | MoE 20–35B | 7 | 21–35 | |
| Mini PC, Ryzen AI Max+ 395, 128 GB | MoE 100–122B | 3 | 9–15 | |
| | MoE 20–35B | 5 | 15–25 | about $178 |
| NVIDIA DGX Spark, 128 GB | MoE 100–122B | 3 | 9–15 | |
| | MoE 20–35B | 5 | 15–25 | about $348 |
| Workstation, RTX PRO 6000 96 GB | Medium 7–9B | 24 | 72–120 | |
| | MoE 20–35B | 35 | 105–175 | about $114 |
| | MoE 100–122B | 22 | 66–110 | |

**Recommendations:**
- **For people:** any laptop runs small models; a gaming laptop with an 8 GB card runs the 7–9B class well.
- **Small company (default):** office desktop with an RTX 5060 Ti 16 GB, about $1,700–2,000, for a team of 18–30.
- **Best value:** a used RTX 3090 24 GB desktop, about $2,300–2,600, for a team of 36–60.
- **Biggest models on a budget:** the 128 GB AMD mini PC runs 100–122B models for a small team.
- **Not recommended now:** the RTX 5090, about $9,344 new in October 2026 after memory shortages.

**How we calculated it** (collapsible "Method" box):
- **Speed for one person:** memory bandwidth ÷ data read per word × efficiency.
- **Efficiencies:**
  - 0.38 is measured on our two laptops;
  - 0.5 for desktop cards with dense models and 0.3 for mixture-of-experts models, both from a public RTX 3090 benchmark.
- **Models partly in normal memory:** much slower; our 9B on the 4 GB laptop ran at 9 tokens a second.
- **Chats at once:** the smaller of two limits:
  - conversations that fit in the memory left over;
  - shared speed (2.5× one person) ÷ 15 tokens a second each.
- **Team size:** 3–5 × chats at once.
- **Measured vs estimated:** only cells marked "measured" are measured. Everything else is an estimate we'll confirm with our own test kit.

## 7. Market: TAM, SAM, SOM to 2030 (min, mid, max)

- **TAM:** the global market.
- **SAM:** Central Asia.
- **SOM:** Uzbekistan, what we plan to win.

Use `data/market.json`. Show a chart (three lines per level or a stacked view, scenario switcher min/mid/max) and the table.

**TAM: three definitions, all from published reports**
- **Min:** LLM software run on companies' own servers (GMI Insights, on-premises segment). $1.55B in 2025, growing 14.8% a year, to **$3.09B in 2030**.
- **Mid:** all company spending on language-model AI, the spend local AI competes for (GMI Insights). $8.65B in 2025, growing 13.5% a year, to **$16.29B in 2030**.
- **Max:** on-premises enterprise AI of every kind (Grand View Research: enterprise AI $155.2B by 2030, 37.6% a year; on-premises about 34.2%, since cloud is 65.8%). $10.76B in 2025, to **$53.08B in 2030**.
- Cross-check: Market.us puts sovereign AI at $41.1B in 2025 (41% on-premises), growing 20.2% a year.

**SAM: Central Asia = TAM × 0.495%**
- Central Asia is 0.495% of the world economy: Kazakhstan $306.0B, Uzbekistan $147.1B, Turkmenistan $77.4B, Kyrgyzstan $22.6B, Tajikistan $17.5B, together $570.6B out of $115.3T (IMF, 2025).
- We keep that share flat to 2030. This is conservative, because Central Asia grows faster than the world.
- Results:
  - Min: $7.7M in 2025, **$15.3M in 2030**.
  - Mid: $42.8M in 2025, **$80.6M in 2030**.
  - Max: $53.3M in 2025, **$262.7M in 2030**.
- Turkmenistan's figure differs between sources ($77.4B or $49.8B). With the lower one, the 2025 mid SAM would be $41.7M.

**SOM: Uzbekistan, our own bottom-up plan**

Paid seats × $9 a month × 12 = $108 a year per seat.

| Year | Min seats | Min revenue | Mid seats | Mid revenue | Max seats | Max revenue |
|---|---|---|---|---|---|---|
| 2026 | 0 | $0 | 0 | $0 | 0 | $0 |
| 2027 | 60 | $6,480 | 300 | $32,400 | 800 | $86,400 |
| 2028 | 400 | $43,200 | 2,000 | $216,000 | 5,000 | $540,000 |
| 2029 | 1,000 | $108,000 | 5,900 | $637,200 | 12,000 | $1,296,000 |
| 2030 | 2,000 | $216,000 | 9,000 | $972,000 | 20,000 | $2,160,000 |

**Where the mid 2029 seats come from (5,900):**
- 3 of Uzbekistan's 34 banks × about 300 seats = 900;
- 10 of 215 universities × about 200 staff = 2,000;
- 50 of 9,000+ private clinics × about 20 = 1,000;
- 100 other companies × about 20 = 2,000.

In 2030 the mid SOM is about 1.2% of the mid SAM (min 1.4%, max 0.8%). That's a small, believable slice.

## 8. Business model

**Personal: Free.**
- One person, one computer.
- Chat, pictures and files.
- Help from the community.
- Open source (Apache 2.0).

**Business: $9 a person a month, billed yearly.**
- One company server for everyone, so employees don't need strong laptops.
- Company sign-in and admin.
- Shared company documents with access rules.
- Set up and supported by us.
- Every company starts with a free 30-day trial.

Line: **Free runs on one computer. Business gives the whole company one AI server.**

**Why $9:**
- It's less than half of cloud AI ($20 a person a month billed yearly).
- We don't pay for every message: the AI runs on the customer's own hardware. Our costs are building, updating and supporting the software, not running models.
- Hardware is the customer's own, or bought once. Section 6 shows a team of about 18–30 served by a ~$2,000 desktop.

## 9. Projections (mid case, min and max beside it)

Show as a small chart of yearly revenue 2027–2030 for the three cases (from the SOM table), plus this text:
- **2026:** public preview and release 0.2.0; no revenue.
- **2027:** first 3 paying companies (about 300 seats); the agent and tools SDK.
- **2028:** about 2,000 seats; company server edition generally available.
- **2029:** about 5,900 seats; $637,200 a year.
- **2030:** about 9,000 seats; $972,000 a year. Min $216,000, max $2.16M.

The projections cover Uzbekistan only. Other Central Asian countries would be upside, not counted here.

## 10. Use of funds: raising $25,000, pre-seed, 12 months

Goal: our first 3 paying companies. In priority order:

| # | Line | Amount | What it pays for |
|---|---|---|---|
| 1 | App signing and company setup | $2,500 | Register the company; a Windows code-signing certificate (about $300–500 a year; Microsoft's own Artifact Signing isn't open to Uzbekistan) so Windows trusts the installer; simple pilot contracts |
| 2 | AI coding tools | $3,000 | A $200-a-month coding assistant, GitHub, the domain |
| 3 | Server and test hardware | $5,000 | A server we bring to company pilots, plus laptops with 4, 6 and 8 GB cards and an AMD machine, to prove what runs where |
| 4 | Marketing | $5,000 | Telegram, university demos, events, videos |
| 5 | GPU rent: fine-tuning | $6,000 | About 1,200 H100 hours at $3–5 an hour to make small models better and smaller, so localSpace needs less hardware (plan below) |
| 6 | Pilots: install and support | $1,500 | Installing on site, travel and support for 3 companies |
| 7 | Reserve | $2,000 | About 10% for price and exchange-rate changes |

Or help with: 3 trial companies · 2 universities · GPU time · mentors.

## 10b. The GPU plan: lowering the hardware bar ($6,000)

Why it matters: the smaller and smarter the model, the cheaper the computer that runs it. Every step below aims to give people and companies the same quality on cheaper hardware. Use `data/gpu_plan.json`; show the steps as a numbered list with hours, and the goals as three cards.

| Step | Work | What it means | H100 hours |
|---|---|---|---|
| 1 | Make training examples with a big open model | A large open model (gpt-oss-120b / Qwen3.5 122B) writes Uzbek and Russian answers and agent tool-use examples; native speakers spot-check them | 45 |
| 2 | Teach small models more Uzbek | Continued training of 2B, 4B and 9B models on about 2 billion tokens each: public Uzbek web text (FineWeb-2: 2.3 million Uzbek documents, Latin and Cyrillic) mixed with Russian and English | 85 |
| 3 | Teach them chat and agent tool use (distillation) | Small models learn from the big model's examples in English, Russian and Uzbek: following instructions, calling tools reliably, reading files; 6 rounds for 2B, 4B and 9B | 153 |
| 4 | Make models smaller: low-bit training | Quantization-aware training to about 2 bits per weight (ternary), so a 9B model needs about 2.5-3 GB instead of 6.2 GB: 10B tokens for the 4B, 5B tokens for the 9B | 339 |
| 5 | Tune one strong model for company servers | Uzbek and agent tuning of a fast 30-35B mixture-of-experts model (about 8,000 tokens/s per GPU), 3 rounds of 600M tokens | 62 |
| 6 | Test every version | Convert to GGUF, run our own test kit for speed and mistakes in three languages, test on big GPUs | 100 |
| | Repeats: failed runs and tuning (about +50%) | | 392 |
| | **Total** | | **1,176** |

Cost:
- 1,176 hours × $3–5 an hour = about $3,528–5,880. The $6,000 budget assumes the upper end, because GPU prices rose in 2026.
- H100 prices in October 2026: $1.99–3.99 on RunPod and $3.29–4.29 on Lambda.
- If idrock gives us GPU cluster time, this line shrinks and the money moves to pilots.

Goals, each measured with our own test kit before we claim it:

| Goal | Target | What it changes |
|---|---|---|
| Good Uzbek on small machines | A tuned 4B model answers Uzbek as well as today's 9B on our test set | Good Uzbek at ~19 words/s on 4 GB laptop cards (today's 9B: ~7) and ~5 words/s with no graphics card |
| A 9B model in 3 GB | Low-bit 9B keeps quality within a few points of the normal 9B on our test set | Fits fully on 4 GB cards; about twice the speed on any machine; a company server holds about twice as many conversations |
| Agents on mid-range computers | Small models call tools correctly in 9 of 10 tries on our agent test set | The localSpace agent works on ordinary laptops, not only on big GPUs |

Why we think it works:
- A fine-tuned 770M model beat the 540B PaLM (few-shot) on a benchmark: over 700x smaller (Distilling Step-by-Step, 2023): https://arxiv.org/pdf/2305.02301
- BitNet b1.58 2B4T: 0.4 GB of memory vs 1.4-4.8 GB for similar full-precision models, with similar benchmark scores (2025): https://arxiv.org/pdf/2504.12285

What we'll use:
- open models whose licences allow fine-tuning (for example Qwen, Apache 2.0);
- public Uzbek text (FineWeb-2: 1,098,843 Latin-script and 1,247,285 Cyrillic-script Uzbek documents);
- examples written by a large open model and spot-checked by native speakers.

## 11. History: from the beginning

| When | What happened |
|---|---|
| August 2026 | First specification: a private AI workstation in Rust, running open models fully offline. Focus first set on companies (banks, clinics, research labs). |
| September 2026 | Rebuilt on the current stack: Rust core, desktop app (Tauri), llama.cpp engine. Multi-user core built with automatic checks. |
| 22 September 2026 | Test A: 10+ testers on their own laptops. |
| 25 September 2026 | Source code made public on GitHub. |
| October 2026 | Joined the idrock accelerator programme. |
| October 2026 | Models updated to Qwen3.5, Gemma 4 and Ministral. Whiteboard removed to focus on chat and agents. |
| 18 October 2026 | Pictures in chat added, after a request from a tester with an RTX 5080. |
| 20 October 2026 | Ran on a laptop with no graphics card (Iris Xe, 8 GB): 6–7 tokens a second. |
| October 2026 | Public preview v0.2.0-preview.1 released. Landing page with a download counter. Telegram community opened. |
| 21 October 2026 | Licence decided: Apache 2.0 for the personal app and SDK; the company server stays closed. |
| 24 October 2026 | Handwritten maths test passed in English, Russian and Uzbek. |
| 11–12 November 2026 | Release 0.2.0 check (planned). |

## 12. Team

- **Abdulloh Shavkatjonov, Founder.** Builds localSpace end to end.
  - Studies AI & Robotics at New Uzbekistan University (2nd year, 2025–2029). Use the NewUU logo.
  - Completed GameDevHQ's Professional Game Developer programme. Use the GameDevHQ logo.
  - Taking ML Zoomcamp. Use the ML Zoomcamp logo.
- Looking for: mentors, and later a first engineer and a sales lead.

## 13. Company and legal

- **Company:** not registered yet. Registering is the first item in the use of funds.
- **Ownership:** 100% founder.
- **Licence:**
  - Apache 2.0 for the personal desktop app and the SDK.
  - The company server, extensions, marketplace and signing stay closed.
  - Copyright: Abdulloh Shavkatjonov.
- **Spending to date:** AI tools provided through the idrock accelerator programme. No other money raised.
- **Privacy:** no telemetry; nothing is sent automatically from the app.

## 14. Risks we watch

- **One-person team.** Mitigation: AI-assisted development with automatic checks; hire after the raise.
- **Hardware prices rose sharply in 2026** (memory shortage). Mitigation: we target mid-range and used hardware and measure each machine.
- **Big companies may build local AI themselves.** Mitigation: their IT teams ask us which hardware to buy; setup and support are what we sell.
- **Agent features are still in development.** Mitigation: the preview is public, so every claim can be checked.
- **Fine-tuning may not reach every goal.** Mitigation: every model is measured with our test kit before release; if a smaller model isn't good enough, we keep the larger one.

## 15. Sources (every link used)

Market:
- GMI Insights, Enterprise LLM Market: https://www.gminsights.com/industry-analysis/enterprise-llm-market
- Grand View Research, Enterprise AI Market: https://www.grandviewresearch.com/industry-analysis/enterprise-artificial-intelligence-market-report
- Market.us, Sovereign AI Market: https://market.us/report/sovereign-ai-market/
- Research and Markets, Enterprise LLM Market (cross-check: $5.65B in 2025 to $41.57B in 2033): https://www.researchandmarkets.com/reports/6176712/enterprise-llm-market-size-share-and-trends
- IMF GDP 2025 by country (via Worldometer): https://www.worldometers.info/gdp/gdp-by-country/?region=worldwide&year=2025&metric=nominal
- World GDP 2025, $115.3T (IMF, via BusinessDay): https://businessday.ng/news/article/top-10-largest-economies-in-the-115tn-world-of-2025/
- 34 banks in Uzbekistan (CERR, via Kun.uz): https://kun.uz/en/news/2026/07/27/uzbekistans-banking-sector-poss-two-thirds-increase-in-net-profit
- 215 universities, 1.535M students (via Yep.uz): https://yep.uz/en/2026/06/higher-education-uzbekistan-2026/
- 9,000+ private clinics (via UzDaily): https://www.uzdaily.uz/en/number-of-private-healthcare-institutions-in-uzbekistan-exceeds-9000/
- 671,664 operating enterprises, 1 Jan 2026 (via INVEXI): https://invexi.org/press/economic-situation-of-the-republic-of-uzbekistan-for-2025/

Problem:
- Uzbekistan personal-data law, ZRU-666 (Mondaq): https://mondaq.com/data-protection/1197754/the-law-on-personal-data-has-been-amended
- NTT DATA, Enterprise AI hits the wall (May 2026): https://www.nttdata.com/en-us/news/2026/enterprise-ai-hits-the-wall-ntt-data-research-reveals-growing-privacy-and-sovereignty-barriers
- ChatGPT Business price: https://elephas.app/resources/chatgpt-business-pricing
- Claude Team price: https://krater.ai/blog/claude-team-plan-pricing
- Microsoft 365 Copilot price: https://eesel.ai/blog/copilot-pricing

Hardware prices:
- RTX 5090 price, October 2026: https://bestvaluegpu.com/history/new-and-used-rtx-5090-price-history-and-specs/
- RTX 5060 Ti 16 GB and RTX 3090 prices: https://gpupricehistory.com/us/rtx-5060-ti/vs/rtx-3090
- Used graphics card prices, September 2026: https://pcserverandparts.com/news/used-graphics-card-buying-guide-2026/
- DGX Spark prices: https://www.kucoin.com/news/flash/nvidia-launches-64gb-dgx-spark-at-4999-128gb-version-rises-to-6950
- Ryzen AI Max+ 395 mini PC prices: https://www.compute-market.com/blog/strix-halo-mini-pc-local-ai-2026
- RTX PRO 6000 price over $10,000: https://www.digitalcitizen.life/nvidia-rtx-pro-6000-blackwell-prices-climb-past-10000-as-ai-demand-keeps-rising/
- RTX 5060 laptop, Acer Nitro V $1,100: https://www.wepc.com/news/nitro-v-rtx-5060-gaming-laptop-falls-back-to-its-lowest-price-so-far
- RTX 5060 laptop, HP Omen 16 $1,279: https://www.tomsguide.com/computing/gaming-laptops/score-rtx-5060-equipped-hp-omen-16-is-at-its-lowest-ever-price-usd300-off-for-a-limited-time
- Budget Iris Xe laptops (India list prices): https://www.mysmartprice.com/computer/pricelist/core-i5-11th-gen-laptops-price-list-in-india.html
- 32 GB DDR5 at $375 minimum: https://www.tomshardware.com/pc-components/ddr5/32gb-of-ddr5-now-costs-usd375-minimum-ai-shortage-continues-to-squeeze-pc-building

Models and speed:
- RTX 3090 speed benchmark: https://www.hardware-corner.net/gpu-llm-benchmarks/rtx-3090/
- Qwen3.5 4B file sizes: https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF
- Qwen3.5 9B file sizes: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Qwen3.5 27B file sizes: https://huggingface.co/bartowski/Qwen_Qwen3.5-27B-GGUF
- Qwen3.5 35B-A3B file sizes: https://modelfit.io/quant-compare/qwen3.5-35b-a3b/
- gpt-oss-20b parameters and memory: https://canirun.ai/model/gpt-oss-20b/
- gpt-oss-120b parameters and memory: https://www.yottalabs.ai/post/gpt-oss-120b-hardware-requirements-gpu-memory-2026

Fine-tuning plan:
- NVIDIA DGX Cloud benchmark, fine-tuning Llama 3 8B on H100: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/dgxc-benchmarking/resources/ft-llama3-8b-dgxc-benchmarking-e
- gpt-oss-120b throughput on H100 (SemiAnalysis InferenceX): https://inferencex.semianalysis.com/compare/gptoss-120b-h100-vs-h200
- FineWeb-2 dataset (Uzbek subsets): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Distilling Step-by-Step (small model beats a 700x larger one): https://arxiv.org/pdf/2305.02301
- BitNet b1.58 2B4T technical report (low-bit model, 0.4 GB): https://arxiv.org/pdf/2504.12285
- Gemma 4 sizes and memory (Unsloth): https://unsloth.ai/docs/models/gemma-4
- Qwen3.5 122B-A10B size (ModelFit): https://modelfit.io/blog/qwen35-122b-a10b-vram-requirements/
- Model speeds on a 16 GB card (llama.cpp benchmarks): https://glukhov.org/llm-performance/benchmarks/best-llm-on-16gb-vram-gpu/

Use of funds:
- Coding assistant, $200 a month: https://intuitionlabs.ai/articles/claude-max-plan-pricing-usage-limits
- Windows code signing options (Microsoft): https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options
- Code-signing certificate prices: https://sslinsights.com/sectigo-code-signing-certificate-guide/
- Azure Artifact Signing pricing: https://www.itechguides.com/products/azure-artifact-signing/
- GPU rent, H100 prices: https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison

Ours:
- Speed numbers: our own measurements on our test laptops, October 2026.
- Product site and preview download: https://linusip.github.io/localLabs/
- Community: https://t.me/localSpace_discussion

## 16. Contact

- Abdulloh Shavkatjonov
- locallabs.io@gmail.com
- https://linusip.github.io/localLabs/
- https://t.me/localSpace_discussion

"""GPU hours for the $10,000 GPU line (November 2026). Run from the repository root: python tools-src/gpu_plan.py

Formula for every training step: hours = tokens to train / tokens a second of one H100 / 3,600.
Repeats (failed runs and tuning) add about 50%.

Throughputs per H100 (unchanged from October):
- training an 8B model: ~12,400 tokens/s full fine-tune (NVIDIA DGX Cloud benchmark, Llama 3 8B, BF16); we use 11,000 for 9B, 25,000 for 4B, 45,000 for 2B
- quantization-aware (low-bit) training: 0.7x normal speed (our assumption)
- teacher model gpt-oss-120b serving: ~6,300 tokens/s per H100 (SemiAnalysis InferenceX)
- a fast 30-35B mixture-of-experts model, tuning: ~8,000 tokens/s per H100 (our assumption, as in October)

ESTIMATES, NOT SETTLED (November 2026). The goal is good answers in every language, so steps 1-3, 5 and 6 now
cover the 12 languages of our test kit: English, Chinese, Spanish, Hindi, Arabic, Portuguese, Russian, French,
German, Japanese, Turkish and Uzbek. The token amounts below are our assumptions for that, to be confirmed:
- step 1: the teacher writes about 75M tokens of examples per language, 900M in total (October: 300M, mostly Uzbek and Russian);
  as before, 3x the generation time for drafts that are thrown away, plus 5 hours to set up
- step 2: continued training on about 4B tokens per model (about 330M per language) for each of 2B, 4B and 9B (October: 2B, mostly Uzbek)
- step 3: 6 rounds of 1.2B tokens (about 100M per language) for each of 2B, 4B and 9B (October: 6 rounds of 600M)
- step 4: unchanged (10B tokens for the 4B, 5B tokens for the 9B); low-bit training doesn't depend on the language mix
- step 5: 3 rounds of 1.2B tokens (about 100M per language) (October: 3 rounds of 600M)
- step 6: 250 hours of testing: 12 languages instead of 3, and more model families such as LFM3 (LFM Open License) and Gemma (October: 100 hours)
"""
import json
T9,T4,T2,QAT,TEACHER,MOE=11000,25000,45000,0.7,6300,8000
LANGS=12
h=lambda tokens,tps: tokens/tps/3600
work=[
 dict(step=1,name="Make training examples with a big open model",detail="A large open model (gpt-oss-120b / Qwen3.5 122B) writes answers and agent tool-use examples in the 12 languages of our test kit, about 75M tokens per language; native speakers spot-check samples",
      hours=round(h(75e6*LANGS,TEACHER)*3+5)),
 dict(step=2,name="Teach small models more languages",detail="Continued training of 2B, 4B and 9B models on about 4 billion tokens each: public web text in the 12 test-kit languages (for example FineWeb-2), about 330 million tokens per language",
      hours=round(h(4e9,T9)+h(4e9,T4)+h(4e9,T2))),
 dict(step=3,name="Teach them chat and agent tool use (distillation)",detail="Small models learn from the big model's examples in all 12 test-kit languages: following instructions, calling tools reliably, reading files; 6 rounds of 1.2B tokens for 2B, 4B and 9B",
      hours=round(6*(h(1.2e9,T9)+h(1.2e9,T4)+h(1.2e9,T2)))),
 dict(step=4,name="Make models smaller: low-bit training",detail="Quantization-aware training to about 2 bits per weight (ternary), so a 9B model needs about 2.5-3 GB instead of 6.2 GB: 10B tokens for the 4B, 5B tokens for the 9B",
      hours=round(h(10e9,T4*QAT)+h(5e9,T9*QAT))),
 dict(step=5,name="Tune one strong model for company servers",detail="Multilingual and agent tuning of a fast 30-35B mixture-of-experts model (about 8,000 tokens/s per GPU), 3 rounds of 1.2B tokens across the 12 languages",
      hours=round(h(3*1.2e9,MOE))),
 dict(step=6,name="Test every version",detail="Convert to GGUF, run our own test kit for speed and mistakes in all 12 languages, on more model families (for example LFM3, under the LFM Open License, and Gemma), test on big GPUs",
      hours=250),
]
core=sum(w["hours"] for w in work)
repeats=round(core*0.5)
total=core+repeats
out=dict(budget_usd=10000,core_hours=core,repeats_hours=repeats,total_hours=total,
  cost_range=dict(at_2_usd=total*2,at_3_usd=total*3,at_4_usd=total*4,at_5_usd=total*5),
  price_source="H100: $1.99-2.69 community cloud, $2.89-3.99 secure cloud (RunPod), $3.29-4.29 (Lambda), Oct 2026",
  note="Repeats = failed runs and tuning, about +50%. The $10,000 budget assumes the upper end of $3-5 an hour. Token amounts for the 12 languages are estimates (see tools-src/gpu_plan.py). If idrock gives us GPU cluster time, this line shrinks.",
  languages=["English","Chinese","Spanish","Hindi","Arabic","Portuguese","Russian","French","German","Japanese","Turkish","Uzbek"],
  steps=work,
  goals=[
   dict(name="Good answers in many languages on small machines",target="A tuned 4B model answers as well as today's 9B on our test set, in each of the 12 languages",effect="Good answers at ~19 words/s on 4 GB laptop cards (today's 9B: ~7) and ~5 words/s with no graphics card"),
   dict(name="A 9B model in 3 GB",target="Low-bit 9B keeps quality within a few points of the normal 9B on our test set",effect="Fits fully on 4 GB cards; about twice the speed on any machine; a company server holds about twice as many conversations"),
   dict(name="Agents on mid-range computers",target="Small models call tools correctly in 9 of 10 tries on our agent test set",effect="The localSpace agent works on ordinary laptops, not only on big GPUs"),
  ],
  evidence=[
   dict(text="A fine-tuned 770M model beat the 540B PaLM (few-shot) on a benchmark: over 700x smaller (Distilling Step-by-Step, 2023)",url="https://arxiv.org/pdf/2305.02301"),
   dict(text="BitNet b1.58 2B4T: 0.4 GB of memory vs 1.4-4.8 GB for similar full-precision models, with similar benchmark scores (2025)",url="https://arxiv.org/pdf/2504.12285"),
  ])
json.dump(out,open("data/gpu_plan.json","w",newline="\n",encoding="utf-8"),indent=1,ensure_ascii=False)
for w in work: print(w["step"],w["name"],w["hours"])
print("core",core,"repeats",repeats,"total",total,out["cost_range"])

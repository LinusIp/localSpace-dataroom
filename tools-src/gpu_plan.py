"""GPU hours for the $6,000 GPU line. Throughputs per H100:
- training an 8B model: ~12,400 tokens/s full fine-tune (NVIDIA DGX Cloud benchmark, Llama 3 8B, BF16); we use 11,000 for 9B, 25,000 for 4B, 45,000 for 2B
- quantization-aware (low-bit) training: 0.7x normal speed (our assumption)
- teacher model gpt-oss-120b serving: ~6,300 tokens/s per H100 (SemiAnalysis InferenceX)"""
import json
T9,T4,T2,QAT=11000,25000,45000,0.7
h=lambda tokens,tps: tokens/tps/3600
work=[
 dict(step=1,name="Make training examples with a big open model",detail="A large open model (gpt-oss-120b / Qwen3.5 122B) writes Uzbek and Russian answers and agent tool-use examples; native speakers spot-check them",
      hours=round(h(300e6,6300)*3+5)),
 dict(step=2,name="Teach small models more Uzbek",detail="Continued training of 2B, 4B and 9B models on about 2 billion tokens each: public Uzbek web text (FineWeb-2: 2.3 million Uzbek documents, Latin and Cyrillic) mixed with Russian and English",
      hours=round(h(2e9,T9)+h(2e9,T4)+h(2e9,T2))),
 dict(step=3,name="Teach them chat and agent tool use (distillation)",detail="Small models learn from the big model's examples in English, Russian and Uzbek: following instructions, calling tools reliably, reading files; 6 rounds for 2B, 4B and 9B",
      hours=round(6*(h(600e6,T9)+h(600e6,T4)+h(600e6,T2)))),
 dict(step=4,name="Make models smaller: low-bit training",detail="Quantization-aware training to about 2 bits per weight (ternary), so a 9B model needs about 2.5-3 GB instead of 6.2 GB: 10B tokens for the 4B, 5B tokens for the 9B",
      hours=round(h(10e9,T4*QAT)+h(5e9,T9*QAT))),
 dict(step=5,name="Tune one strong model for company servers",detail="Uzbek and agent tuning of a fast 30-35B mixture-of-experts model (about 8,000 tokens/s per GPU), 3 rounds of 600M tokens",
      hours=round(h(3*600e6,8000))),
 dict(step=6,name="Test every version",detail="Convert to GGUF, run our own test kit for speed and mistakes in three languages, test on big GPUs",
      hours=100),
]
core=sum(w["hours"] for w in work)
repeats=round(core*0.5)
total=core+repeats
out=dict(budget_usd=6000,core_hours=core,repeats_hours=repeats,total_hours=total,
  cost_range=dict(at_2_usd=total*2,at_3_usd=total*3,at_4_usd=total*4),
  price_source="H100: $1.99-2.69 community cloud, $2.89-3.99 secure cloud (RunPod), $3.29-4.29 (Lambda), Oct 2026",
  note="Repeats = failed runs and tuning, about +50%. The rest of the $6,000 covers 2026 GPU price rises. If idrock gives us GPU cluster time, this line shrinks.",
  steps=work,
  goals=[
   dict(name="Good Uzbek on small machines",target="A tuned 4B model answers Uzbek as well as today's 9B on our test set",effect="Good Uzbek at ~19 words/s on 4 GB laptop cards (today's 9B: ~7) and ~5 words/s with no graphics card"),
   dict(name="A 9B model in 3 GB",target="Low-bit 9B keeps quality within a few points of the normal 9B on our test set",effect="Fits fully on 4 GB cards; about twice the speed on any machine; a company server holds about twice as many conversations"),
   dict(name="Agents on mid-range computers",target="Small models call tools correctly in 9 of 10 tries on our agent test set",effect="The localSpace agent works on ordinary laptops, not only on big GPUs"),
  ],
  evidence=[
   dict(text="A fine-tuned 770M model beat the 540B PaLM (few-shot) on a benchmark: over 700x smaller (Distilling Step-by-Step, 2023)",url="https://arxiv.org/pdf/2305.02301"),
   dict(text="BitNet b1.58 2B4T: 0.4 GB of memory vs 1.4-4.8 GB for similar full-precision models, with similar benchmark scores (2025)",url="https://arxiv.org/pdf/2504.12285"),
  ])
json.dump(out,open("data/gpu_plan.json","w"),indent=1,ensure_ascii=False)
for w in work: print(w["step"],w["name"],w["hours"])
print("core",core,"repeats",repeats,"total",total,out["cost_range"])

"""Hardware tiers x model classes for the localSpace investor page.
Speed for one person = memory bandwidth / bytes read per token x efficiency.
Efficiencies: 0.38 measured on our two laptops; 0.5 dense / 0.3 MoE from a public RTX 3090 benchmark.
Chats at once = min(conversations that fit in leftover memory, shared throughput / 15 tokens a second each).
Team size = 3-5 x chats at once. Only rows marked measured are measured; the rest are estimates."""
import json, math
EFF_LAPTOP=0.38; EFF_DENSE=0.5; EFF_MOE=0.3; GAIN=2.5; TARGET=15; FREE=1.5; WORDS=0.75
CLASSES=[
 dict(id="tiny", name="Tiny, 1-2B", file=1.5, read=1.5, moe=False, kv=0.25, quality="Basic: quick answers, simple tasks",
      examples=["Qwen3.5 0.8B and 2B","Gemma 4 E2B","Llama 3.2 1B"]),
 dict(id="small", name="Small, 3-4B", file=3.0, read=3.0, moe=False, kv=0.4, quality="Basic+: everyday chat, pictures",
      examples=["Qwen3.5 4B","Gemma 4 E4B","Phi-4-mini","Ministral 3B"]),
 dict(id="medium", name="Medium, 7-9B", file=6.2, read=6.2, moe=False, kv=0.5, quality="Good: everyday work, documents, pictures",
      examples=["Qwen3.5 9B","Ministral 8B","Llama 3.1 8B"]),
 dict(id="upper", name="Upper-medium, 12-14B", file=9.0, read=9.0, moe=False, kv=0.6, quality="Good+: longer documents, better reasoning",
      examples=["Ministral 14B","Phi-4 14B","Qwen3 14B"]),
 dict(id="moe-mid", name="Fast mixture-of-experts, 20-35B", file=18.0, read=2.5, moe=True, kv=0.6, quality="Strong: reasoning and tool use, fast",
      examples=["gpt-oss-20b (13 GB)","Gemma 4 26B-A4B (16-18 GB)","Qwen3.5 35B-A3B (21 GB)"]),
 dict(id="dense-large", name="Large dense, 27-32B", file=18.0, read=18.0, moe=False, kv=0.8, quality="Strong: hardest single-user tasks",
      examples=["Qwen3.5 27B","Gemma 4 31B","Qwen3 32B"]),
 dict(id="moe-xl", name="Very large mixture-of-experts, 100-122B", file=66.0, read=4.0, moe=True, kv=1.0, quality="Very strong: closest to cloud assistants",
      examples=["gpt-oss-120b (61 GB)","Qwen3.5 122B-A10B (72 GB)","Mistral Small 4 119B"]),
]
HW=[
 dict(id="office-laptop", name="Office laptop, Intel Iris Xe, 8 GB RAM", role="Personal", price=[400,800],
      price_note="Budget laptops, India list prices Oct 2026 (Rs 33,000-70,000)", bw=51.2, mem=4.5, spill=0, laptop=True,
      measured={"small":6.5}, support="Works today (Windows)"),
 dict(id="laptop-4gb", name="Gaming laptop, RTX 3050 Ti 4 GB, 16 GB RAM (our test laptop)", role="Personal", price=None,
      price_note="2022 model; used prices vary", bw=192, mem=4, spill=8, laptop=True,
      measured={"small":25.0,"medium":9.0}, support="Works today (Windows)"),
 dict(id="laptop-8gb", name="Gaming laptop, RTX 5060 8 GB", role="Personal", price=[1100,1300],
      price_note="Acer Nitro V $1,100 (Mar 2026); HP Omen 16 $1,279", bw=384, mem=8, spill=8, laptop=True, measured={}, support="Works today (Windows)"),
 dict(id="desktop-16gb", name="Office desktop, RTX 5060 Ti 16 GB, 32 GB RAM", role="Small company server (default)", price=[1700,2000],
      price_note="Card $789 + about $1,000 for the rest (32 GB DDR5 alone about $375)", bw=448, mem=16, spill=16, laptop=False, measured={},
      support="Works today (Windows); company server edition planned"),
 dict(id="desktop-24gb", name="Desktop, used RTX 3090 24 GB, 32 GB RAM", role="Company server (best value)", price=[2300,2600],
      price_note="Used card about $1,343 (Sep 2026 average) + about $1,100 for the rest", bw=936, mem=24, spill=16, laptop=False, measured={},
      support="Works today (Windows); company server edition planned"),
 dict(id="minipc-128gb", name="Mini PC, AMD Ryzen AI Max+ 395, 128 GB", role="Big models, smaller teams", price=[3450,3650],
      price_note="GMKtec EVO-X2 $3,499.99-3,649.99; Framework Desktop $3,449 (Sep 2026)", bw=256, mem=96, spill=0, laptop=False, measured={},
      support="Works today (Windows, Vulkan)"),
 dict(id="dgx-spark", name="NVIDIA DGX Spark, 128 GB", role="Big models, smaller teams", price=[6950,6950],
      price_note="128 GB Founders Edition $6,950 (64 GB version $4,999), Oct 2026", bw=273, mem=110, spill=0, laptop=False, measured={},
      support="Planned (Linux server edition)"),
 dict(id="workstation-96gb", name="Workstation, RTX PRO 6000 96 GB", role="Large company server", price=[13000,19000],
      price_note="Card $10,000-16,000 in 2026 + about $3,000 for the rest", bw=1792, mem=96, spill=32, laptop=False, measured={},
      support="Works today (Windows); company server edition planned"),
]
def run(h,c):
    if c["id"] in h["measured"]:
        return dict(fit="measured", tps=h["measured"][c["id"]])
    eff = EFF_LAPTOP if h["laptop"] else (EFF_MOE if c["moe"] else EFF_DENSE)
    if c["file"]+0.3 <= h["mem"]:
        return dict(fit="fits", tps=eff*h["bw"]/c["read"])
    if c["file"] <= h["mem"]+h["spill"] and not c["id"]=="moe-xl":
        # part of the model in normal memory: much slower (our 9B on the 4 GB laptop: 9 tok/s, about 0.6x)
        on_card=h["mem"]/c["file"]
        tps=eff*h["bw"]/c["read"]*max(0.15,on_card*0.6)
        return dict(fit="slow (part in normal memory)", tps=tps)
    return dict(fit="does not fit", tps=None)
out=[]
for h in HW:
    cells={}
    for c in CLASSES:
        r=run(h,c)
        cells[c["id"]]=dict(fit=r["fit"], tokens_per_sec=None if r["tps"] is None else round(r["tps"]),
                            words_per_sec=None if r["tps"] is None else round(r["tps"]*WORDS))
    # serving capacity (server tiers): medium 9B-class model, and the biggest class that fits
    serve=[]
    if not h["laptop"]:
        for cid in ["medium","moe-mid","moe-xl"]:
            c=next(x for x in CLASSES if x["id"]==cid); r=run(h,c)
            if r["fit"]!="fits": continue
            slots=math.floor((h["mem"]-c["file"]-FREE)/c["kv"]); thr=math.floor(r["tps"]*GAIN/TARGET)
            conc=max(1,min(slots,thr)); team=[conc*3,conc*5]
            pm=None if h["price"] is None else sum(h["price"])/2
            once=None if pm is None else round(pm/(sum(team)/2))
            serve.append(dict(model_class=c["name"],chats_at_once=conc,team_size=team,
                hardware_cost_per_person_once_usd=once,
                hardware_cost_per_person_month_usd=None if once is None else round(once/36,1)))
    pmid=None if h["price"] is None else sum(h["price"])/2
    best=max(serve,key=lambda s:s["chats_at_once"]) if serve else None
    ppp=None
    out.append(dict(id=h["id"],name=h["name"],role=h["role"],price_usd=h["price"],price_note=h["price_note"],
        memory_bandwidth_gbs=h["bw"],ai_memory_gb=h["mem"],support=h["support"],classes=cells,serving=serve))
json.dump(dict(note="Any open model in GGUF format can be loaded with 'bring your own model' (0.2.1). Classes below are by size; the app picks the best that fits.",
    assumptions=dict(efficiency_laptop_measured=EFF_LAPTOP,efficiency_desktop_dense=EFF_DENSE,efficiency_moe=EFF_MOE,sharing_gain=GAIN,
    tokens_per_person=TARGET,kept_free_gb=FREE,words_per_token=WORDS,team_size_rule="3x-5x chats at once", hardware_cost_rule="machine price (middle of range) / middle of team size; per month = spread over 3 years. This is the company's one-time hardware cost, not localSpace's price (Personal is free; Business is $9 a person a month)."),
    model_classes=CLASSES,tiers=out),open("data/hardware.json","w"),indent=1,ensure_ascii=False)
hdr="%-38s"%"" + "".join("%-13s"%c["id"] for c in CLASSES); print(hdr)
for t in out:
    row="%-38s"%t["name"][:37]
    for c in CLASSES:
        x=t["classes"][c["id"]]; s="—" if x["words_per_sec"] is None else str(x["words_per_sec"])+("m" if x["fit"]=="measured" else ("s" if x["fit"].startswith("slow") else ""))
        row+="%-13s"%s
    print(row)

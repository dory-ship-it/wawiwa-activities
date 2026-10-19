#!/usr/bin/env python3
"""Build Greystone Canada trainer guides + participant guides (PDF) for the 5 Wawiwa units."""
import asyncio, base64, html, os
from playwright.async_api import async_playwright

OUT = "/tmp/claude-0/guides/out"
LOGO = base64.b64encode(open("/mnt/user-data/uploads/WawiwaPRO-G40--Wawiwa/Template + Logo 2023/JustWawiwa-Logo-1000x425px-trans.png", "rb").read()).decode()

CSS = """
@page { size: Letter; margin: 18mm 16mm 18mm 16mm; }
body { font-family: Inter, Arial, sans-serif; color:#1f2430; font-size:10.5pt; line-height:1.45; }
.hd { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e8433a; padding-bottom:6px; margin-bottom:14px; }
.hd img { height:20pt; }
.hd .tag { font-size:8.5pt; color:#6b7280; text-align:right; }
h1 { font-size:19pt; margin:4px 0 2px; }
.sub { color:#4b5563; margin:0 0 12px; }
h2 { font-size:12.5pt; color:#b5302a; margin:16px 0 6px; border-bottom:1px solid #eee; padding-bottom:3px; }
h3 { font-size:11pt; margin:10px 0 4px; }
table { border-collapse:collapse; width:100%; margin:4px 0 8px; }
td, th { border:1px solid #e5e7eb; padding:5px 7px; vertical-align:top; text-align:left; font-size:9.8pt; }
th { background:#f6f6f7; width:28%; }
ul, ol { margin:3px 0 6px 18px; padding:0; }
li { margin:2px 0; }
.box { background:#fff6f5; border-left:3px solid #e8433a; padding:7px 10px; margin:8px 0; }
.week { border:1px solid #e5e7eb; border-radius:4px; padding:8px 10px; margin:8px 0; page-break-inside:avoid; }
.week h3 { margin-top:0; }
.small { font-size:8.5pt; color:#6b7280; }
"""

COMMON_TRAINER_NOTES = [
    "Open the unit in Moodle a day before class and click through it once, so you see the presentation and activities load.",
    "The slides play inside the unit (the \"Presentation\" block). Use full-screen mode in class. The overview activities after the presentation are for review at home or in the last minutes of class.",
    "If a learner sees \"This course is not available\", the unit could not confirm its licence. Ask the learner to reload; if it persists, contact your program administrator.",
]

UNITS = [
 dict(code="BUS-DM102", course="Fundamentals: Domain, Online and Email Marketing",
      title="Generative AI in Marketing", file="GC_BUS-DM102",
      source="Wawiwa Generative AI for Marketing Professionals, Session 1",
      tools="A free ChatGPT account for each learner (optional for weeks 1-2, needed for the home task).",
      outcomes=["Explain what AI, machine learning and generative AI are, and how they evolved.",
                "Name the main generative AI tools for text, images, video and audio.",
                "Describe how AI is changing marketing roles and processes.",
                "Write a basic, structured prompt for a marketing task."],
      weeks=[
        ("Week 1 - What is generative AI?", "Slides 4-17",
         ["Icebreaker (slide 3): learners share a short intro and what they want to learn about AI.",
          "Learning goals and what to expect (slides 4-5).",
          "Definitions and the evolution of AI from the 1950s to today (slides 7-14).",
          "Machine learning, generative AI, narrow vs general AI (slides 15-17).",
          "Close with the question on slide 18: why is everyone talking about AI now?"]),
        ("Week 2 - The generative AI tool landscape", "Slides 18-28 + the AI Awareness interactive",
         ["Large language models and a live example (slides 19-21: a ChatGPT poem, a Perplexity market research).",
          "Images, video, avatars, deepfakes, audio and songs (slides 22-27). Discuss the deepfake slide (24) and what it means for brand trust.",
          "\"There's an AI tool for everything\" (slide 28).",
          "Run the AI Awareness interactive in the unit together, screen by screen."]),
        ("Week 3 - How AI is changing marketing", "Slides 30-38 + review activities",
         ["The role of marketing and the role of AI in marketing (slides 30-33).",
          "How marketing roles and processes are shifting (slides 34-37).",
          "A recommended AI stack for marketing (slide 38).",
          "Learners complete the review activities: the prompt-writing process, the roles flashcards and the knowledge check."]),
      ],
      skip="Skip slide 2 (the original author's bio) and slide 39 (an agenda from the longer workshop).",
      home="Set up a ChatGPT account and try one marketing task from week 3 (for example, a short product description for a business you know). Note what worked and what didn't.",
      kc=[("Which of the following is a key benefit of using generative AI in marketing?", "It enables the creation of personalised content tailored to specific audiences.")]),
 dict(code="BUS-DM303", course="Writing for the Web", title="Writing for the Web with Generative AI", file="GC_BUS-DM303",
      source="Wawiwa Generative AI for Marketing Professionals, Session 3 (without SEO research and optimisation, as agreed)",
      tools="A ChatGPT account for each learner. A paid ChatGPT plan is needed only to build a custom GPT (\"brand bot\"); without it, learners can paste the same instructions at the start of a chat.",
      outcomes=["Use AI to write company messaging and avoid generic \"AI-sounding\" text.",
                "Define a brand's tone of voice with a simple framework.",
                "Set up a brand bot with instructions and knowledge files.",
                "Produce website, landing page, blog, newsletter, social media and ad copy with AI."],
      weeks=[
        ("Week 1 - Messaging and brand voice", "Slides 1-13",
         ["Marketing plans and presentations with AI (slides 2-3).",
          "Effective prompts recap and company messaging (slides 6-9). Practice: compose company messaging (slide 9).",
          "Avoiding AI lingo and fluff (slide 10).",
          "Defining brand voice with the six-dimension framework, then defining your own tone of voice (slides 11-13)."]),
        ("Week 2 - Build a brand bot", "Slides 14-25",
         ["MyGPT and an example course bot (slides 15-16).",
          "Brand bot instructions and knowledge files (slides 17-20).",
          "Practice: create your brand bot (slide 21).",
          "Content for websites (slides 22 and 25) and the follow-up slides 23-24."]),
        ("Week 3 - Content for every channel", "Slides 26-43",
         ["Landing pages and AI web builders; practice: create a landing page (slides 26-28).",
          "Blogs; practice: write a quick blog (slides 29-30).",
          "Anyword and other content tools, brochures, newsletters (slides 31-33).",
          "Social media; practice: write 5 social posts at once (slides 34-36).",
          "Paid ads (PPC) and what to tell the bot to avoid; practice: create paid ads (slides 37-41).",
          "Localisation, translation and text-to-speech (slides 42-43)."]),
      ],
      skip="Slide 14 is a short break slide; use it or skip it.",
      home="Using your brand bot, write a landing page, a blog and 5 social media posts for one organisation, then note what the bot does well and where it falls short (slide 23).",
      kc=[("Which of the following are benefits of using AI-powered content creation tools in marketing? (select all)",
           "Streamlining the content creation process for efficiency; ensuring consistent brand voice across platforms; adapting content quickly for different audiences and channels.")]),
 dict(code="BUS-DM201", course="Strategic Web Design: The Creative Effort", title="SEO, AEO and Visual Content with Generative AI", file="GC_BUS-DM201",
      source="Wawiwa Generative AI for Marketing Professionals, the SEO part of Session 3 (refreshed with Answer Engine Optimisation) and Session 4",
      tools="ChatGPT for all learners. Optional: Google Search Console access for a real website; Midjourney (paid) for weeks 2-3, or the free image tools named on the slides (ChatGPT images, Ideogram, Nano Banana).",
      outcomes=["Explain SEO and Answer Engine Optimisation (AEO): being found on Google and inside AI answers.",
                "Collect keyword data and analyse it with ChatGPT.",
                "Create logos, illustrations and photographs with AI image tools.",
                "Turn images into short videos and understand video avatars."],
      weeks=[
        ("Week 1 - SEO and AEO", "Lesson 1 presentation (10 slides) + review activities",
         ["SEO basics and getting data (slide 2).",
          "Why AEO matters: people ask AI and search less (slide 3).",
          "Google Search Console, competitors' keywords, an example and SEMrush (slides 4-7).",
          "Analysing keyword files with ChatGPT; practice: find our keywords (slides 8-9).",
          "Ideating blog posts for SEO (slide 10). Learners finish with the SEO/AEO review activities."]),
        ("Week 2 - AI images", "Lesson 2 presentation, slides 2-30",
         ["Generative AI as a source of creativity; images in ChatGPT; practice (slides 4-6).",
          "Vector graphics, Nano Banana, Ideogram, photographs (slides 7-11).",
          "Midjourney: account, basic prompt, upscale, variations, parameters (slides 12-29). If learners have no Midjourney access, demonstrate and let them practise the same prompts in ChatGPT or Ideogram.",
          "Brand style with ChatGPT (slide 30)."]),
        ("Week 3 - People, repurposing and video", "Lesson 2 presentation, slides 31-50",
         ["Images of real people: character reference, Nano Banana (slides 33-36). Discuss consent and likeness rights.",
          "NotebookLM for repurposing your own content (slides 37-39).",
          "AI video: image to video, Veo, avatars, Runway, video prompt tips (slides 40-49).",
          "Practice: create videos with one of the tools (slide 50)."]),
      ],
      skip="In lesson 2 skip slide 51 (an agenda from the longer workshop). Slide 52 lists a home task that mentions the original author: replace \"send me\" with sharing in your class.",
      home="Create one brand visual and one 5-10 second video for an organisation, and write the prompt you used for each.",
      kc=[("Which of the following are benefits of using AI-powered content creation tools in marketing? (select all)",
           "Streamlining the content creation process for efficiency; ensuring consistent brand voice across platforms; improving content visibility through SEO optimisation.")]),
 dict(code="BUS-BA201", course="Introduction to Management", title="Data and AI for Managers", file="GC_BUS-BA201",
      source="Wawiwa AI and Data for Managers (2026 edition), Session 1, plus the \"ChatGPT and Large Language Models\" hour from Wawiwa Generative AI for Marketing Professionals, Session 2 (marketing-specific slides removed)",
      tools="No accounts needed for weeks 1-2. For week 3, a free ChatGPT account for each learner (or another AI assistant the college allows, such as Claude, Copilot or Gemini).",
      outcomes=["Use the core vocabulary of data and AI that managers need.",
                "Start from the decision, not the data, and frame Key Business Questions (KBQs).",
                "Explain what ChatGPT and other large language models (LLMs) are and what they can do.",
                "Use ChatGPT safely and write effective prompts (context, goal, format, iteration)."],
      weeks=[
        ("Week 1 - Speaking the language of data", "Lesson 1 presentation, first half + Game 1",
         ["Why managers need a shared data language.",
          "Types of data, where data lives, analytics and BI, AI basics for leaders.",
          "Play \"The Data Language Challenge\" (in the unit, under Games) in pairs."]),
        ("Week 2 - Start with the decision", "Lesson 1 presentation, second half + Game 2",
         ["Strategic data use cases and the five traps managers fall into.",
          "Start with the decision, not the data; the KBQ framework and the rules for good KBQs.",
          "Play \"The Gut vs. The Data\" in groups, then complete the lesson 1 review activities."]),
        ("Week 3 - ChatGPT and large language models", "Lesson 2 presentation (20 slides) + review activities",
         ["What ChatGPT is and what an LLM can do (slides 4-5).",
          "Signing up, choosing the latest model, privacy, data controls and temporary chats (slides 6-10).",
          "Custom instructions and memory; ask ChatGPT what it knows about you (slides 11-13).",
          "What a prompt is, and how LLMs work behind the scenes (slides 14-15). Live demo: talk with ChatGPT (slide 16).",
          "Prompting best practices and the four-part prompt: context, goal, format and constraints, iteration (slides 18-19).",
          "Benefits and risks of LLMs at work: productivity, creativity, problem-solving, and the risks (lies, lame, legal) (slide 20).",
          "Learners complete the lesson 2 key terms and knowledge checks."]),
      ],
      skip="If a slide introduces Wawiwa's course AI companion, skip it: it is not part of this unit. Week 3 slides come from Wawiwa's AI for Marketing workshop and keep the original author's name on the title slide.",
      home="Use ChatGPT (or another approved AI assistant) to draft a one-page brief for a real decision from work or study, using the four-part prompt. Remove any confidential details first, then note what you had to correct.",
      kc=[("Which is the correct order for making a data-driven decision?", "Decision → Question → Data."),
          ("You need help with a report that includes confidential customer data. What is the safest approach?", "Remove or anonymise the confidential details, and use data controls or a temporary chat."),
          ("Which of these makes a prompt more effective?", "Stating the context, the goal, and the format and constraints, then improving the answer step by step.")]),
 dict(code="BUS-PM202", course="Project Cost, Quality and Risk Management", title="Introduction to Risk Management", file="GC_BUS-PM202",
      source="Wawiwa Introduction to Risk Management, topic 1: Introduction to the Risk Management Framework (RMF), shortened for this course",
      tools="No accounts needed.",
      outcomes=["Define threat agent, threat, vulnerability, asset, impact and risk.",
                "Explain the risk chain and why risk is a function of likelihood and impact.",
                "Describe the seven steps of the NIST RMF lifecycle and how controls are assessed.",
                "Explain risk strategy, appetite and tolerance, identify stakeholders and run a basic Business Impact Analysis."],
      weeks=[
        ("Week 1 - What is risk?", "Slides 1-17",
         ["Course goals and the framework overview (slides 2-3).",
          "\"Eugene Moment\" panels (slides 4-7) mark a class discussion. Use the questions on the slides: what is a risk, why do businesses care, what are goals and assets.",
          "Terms and definitions, the risk chain (slides 8-15).",
          "NIST and the risk management framework (slides 16-17)."]),
        ("Week 2 - The RMF lifecycle and assessing controls", "Slides 18-36",
         ["RMF characteristics and lifecycle (slides 18-19).",
          "NIST publications overview (slides 20-22).",
          "What we assess: control effectiveness, risk, compliance (slides 23-27).",
          "Four ways to assess controls: interview, observe, review documentation, technical testing (slides 28-32).",
          "Managing risk over time (slides 33-36). Ask: how would this apply to a project you know?"]),
        ("Week 3 - Strategy, stakeholders and BIA", "Slides 37-59 + review activities",
         ["Risk strategy, risk appetite and risk tolerance (slides 37-44).",
          "Who the stakeholders are and what they want from risk management (slides 45-53).",
          "Decomposing the organisation and Business Impact Analysis (slides 54-59).",
          "Learners complete the review activities and the two knowledge-check questions."]),
      ],
      skip="The navy \"EUGENE MOMENT\" panel (introduced on slide 4) marks a class discussion; pause there and ask the class the questions in the panel.",
      home="For a project you know, list three assets, one threat and one vulnerability for each, and rate each risk as low, medium or high on likelihood and impact.",
      kc=[("Which statement about risk is correct?", "Risk is a function of likelihood and impact."),
          ("In the RMF lifecycle, which step comes right after Categorize?", "Select.")]),
]

def head(tag):
    return f'<div class="hd"><img src="data:image/png;base64,{LOGO}"><div class="tag">{tag}</div></div>'

def trainer_html(u):
    e = html.escape
    w = "".join(f'<div class="week"><h3>{e(t)}</h3><div class="small">{e(sl)} · about 60 minutes</div><ul>' + "".join(f"<li>{e(x)}</li>" for x in items) + "</ul></div>" for t, sl, items in u["weeks"])
    kc = "".join(f"<tr><td>{e(q)}</td><td>{e(a)}</td></tr>" for q, a in u["kc"])
    return f"""<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{head('Greystone College Canada · Trainer Instructions')}
<h1>{e(u['title'])}</h1><p class="sub">Standalone unit for {e(u['code'])} {e(u['course'])}</p>
<h2>Unit at a glance</h2><table>
<tr><th>Greystone course</th><td>{e(u['code'])} {e(u['course'])}</td></tr>
<tr><th>Based on</th><td>{e(u['source'])}</td></tr>
<tr><th>Length</th><td>Three classroom sessions of about one hour, one per week.</td></tr>
<tr><th>In Moodle</th><td>One SCORM unit: an instructor-led presentation, then review activities and a short knowledge check.</td></tr>
<tr><th>What learners need</th><td>{e(u['tools'])}</td></tr></table>
<h2>Learning outcomes</h2><ul>{''.join(f'<li>{e(o)}</li>' for o in u['outcomes'])}</ul>
<h2>Week by week</h2>{w}
<h2>Notes for the instructor</h2><ul><li>{e(u['skip'])}</li>{''.join(f'<li>{e(x)}</li>' for x in COMMON_TRAINER_NOTES)}</ul>
<h2>Home task</h2><p>{e(u['home'])}</p>
<h2>Knowledge check answers</h2><table><tr><th>Question</th><th>Correct answer</th></tr>{kc}</table>
<p class="small">© Wawiwa Tech. Licensed to Greystone College Canada for use in its programs during the licence period. Not for redistribution.</p>
</body></html>"""

def learner_html(u):
    e = html.escape
    weeks = "".join(f"<li><strong>{e(t.split(' - ')[0])}:</strong> {e(t.split(' - ',1)[1])}</li>" for t, _, _ in u["weeks"])
    return f"""<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{head('Greystone College Canada · Participant Guide')}
<h1>{e(u['title'])}</h1><p class="sub">A three-week unit in {e(u['code'])} {e(u['course'])}</p>
<h2>What you will learn</h2><ul>{''.join(f'<li>{e(o)}</li>' for o in u['outcomes'])}</ul>
<h2>The three weeks</h2><ul>{weeks}</ul>
<h2>What you need</h2><p>{e(u['tools'])}</p>
<h2>How to use the unit in Moodle</h2><ul>
<li>Your instructor presents the slides in class. You can open the same presentation in the unit at any time.</li>
<li>After each class, go through the review activities in the unit: they take a few minutes and end with a short knowledge check.</li>
<li>If you see "This course is not available", reload the page. If it does not open, tell your instructor.</li></ul>
<h2>Your home task</h2><div class="box">{e(u['home'])}</div>
<p class="small">© Wawiwa Tech. For Greystone College learners only.</p>
</body></html>"""

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        for u in UNITS:
            for kind, fn in (("Trainer_Instructions", trainer_html), ("Participant_Guide", learner_html)):
                path = f"{OUT}/{u['file']}_{kind}.pdf"
                await pg.set_content(fn(u), wait_until="load")
                await pg.pdf(path=path, format="Letter", print_background=True)
                print(path)
        await b.close()

asyncio.run(main())

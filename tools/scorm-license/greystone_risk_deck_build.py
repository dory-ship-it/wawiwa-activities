import sys,os
B=os.path.expanduser("~/mnt/WawiwaPRO-G40--Wawiwa/Claude Wawiwa/Curriculum/Slide Decks/Data for Managers/_RENEWAL 2026-10 Grazziotin/")
sys.path.insert(0,B+"_build")
from dfm_lib import *
SRC=B+"A - Trainer fixes (ready)/Session 1/E-Data_Managers-1-presentation.pptx"
OUTD=os.path.expanduser("~/mnt/WawiwaPRO-G40--Wawiwa/Claude Wawiwa/Curriculum/Greystone Canada 2026/U5 Risk redesign/")
prs=Presentation(SRC); fix_tagline(prs)
def walk(shapes):
    for sh in shapes:
        if sh.shape_type==6: yield from walk(sh.shapes)
        else: yield sh
for lay in list(prs.slide_layouts)+[prs.slide_master]:
    for sh in walk(lay.shapes):
        if sh.has_text_frame:
            for p in sh.text_frame.paragraphs:
                for r in p.runs:
                    if r.text.strip()=="T-M": r.text="PM202"
old=list(prs.slides)
cover=old[0]
for sh in cover.shapes:
    if not sh.has_text_frame: continue
    t=sh.text_frame.text
    def setp(vals):
        for p,v in zip(sh.text_frame.paragraphs,vals):
            rs=p.runs
            if rs: rs[0].text=v
            for r in rs[1:]: r.text=""
    if t.startswith("WAWIWA"): setp(["WAWIWA"])
    elif t.startswith("Data for Managers"):
        rs=sh.text_frame.paragraphs[0].runs; vals=["Risk Management: ","Introduction to the RMF"]
        for i,r in enumerate(rs): r.text=vals[i] if i<len(vals) else ""
    elif t.startswith("Session 1"): setp(["BUS-PM202 Unit: Risk Management","Introduction to Risk Management Framework (RMF)",""])
    elif t.strip()=="T-M": setp(["PM202"])
IMG=os.path.expanduser("~/mnt/WawiwaPRO-G40--Wawiwa/Template + Logo 2023/Photos Greyscale/Intro to risk management.png")
lp=[sh for sh in cover.slide_layout.shapes if sh.shape_type==13][0]
from PIL import Image as _I
iw,ih=_I.open(IMG).size; bw,bh=lp.width,lp.height
pic=cover.shapes.add_picture(IMG,lp.left,lp.top,bw,bh)
ar_img=iw/ih; ar_box=bw/bh
if ar_img>ar_box:
    c=(1-ar_box/ar_img)/2; pic.crop_left=c; pic.crop_right=c
else:
    c=(1-ar_img/ar_box)/2; pic.crop_top=c; pic.crop_bottom=c
sp=cover.shapes._spTree; sp.remove(pic._element); sp.insert(2,pic._element)
SL=[cover]
def S(): s=new_slide(prs); SL.append(s); return s
W=12.2; X0=0.55

# ---------- helpers
def panel_q(s,qs,x=8.75,y=1.75,w=4.0,h=4.95,tag="EUGENE MOMENT",head=None):
    rect(s,x,y,w,h,NAVY); rect(s,x+0.05,y+h,w-0.05,0.04,LINE2)
    label(s,x+0.35,y+0.3,w-0.6,tag,size=10)
    yy=y+0.7
    if head:
        text(s,x+0.35,yy,w-0.7,0.9,head,size=17,color=GOLD,bold=True,font="Georgia",lnspc=112); yy+=1.0
    step=min(1.25,(y+h-0.3-yy)/max(1,len(qs)))
    for i,q in enumerate(qs):
        rect(s,x+0.35,yy+0.02,0.36,0.36,GOLD,shape="oval")
        text(s,x+0.35,yy+0.02,0.36,0.36,str(i+1),size=12,color=NAVY,bold=True,align="c",anchor="ctr")
        text(s,x+0.85,yy,w-1.2,step-0.1,q,size=13,color=WHITE,lnspc=118)
        yy+=step

def cards(s,items,y=1.75,h=None,cols=None,x0=X0,w=W,gap=0.25,bodysize=13,titlesize=17,stripe="left",navy_idx=()):
    n=len(items); cols=cols or n; rows=(n+cols-1)//cols
    h=h or ((6.7-y)-(rows-1)*gap)/rows
    cw=(w-gap*(cols-1))/cols
    for i,it in enumerate(items):
        tag,ttl,body=(list(it)+["",""])[:3]
        r,c=divmod(i,cols); x=x0+c*(cw+gap); yy=y+r*(h+gap)
        nv=i in navy_idx
        card(s,x,yy,cw,h,"navy" if nv else "cream",stripe=stripe)
        cy=yy+0.25
        if tag: label(s,x+0.35,cy,cw-0.6,tag,size=10); cy+=0.32
        if ttl:
            cpl=(cw-0.6)*72/(titlesize*0.56); nl=1+int(len(ttl)/cpl); th=0.1+nl*titlesize*1.2/72
            text(s,x+0.35,cy,cw-0.6,th,ttl,size=titlesize,color=WHITE if nv else NAVY,bold=True,lnspc=108); cy+=th+0.12
        if body:
            if isinstance(body,list): bullets(s,x+0.35,cy,cw-0.6,yy+h-cy-0.15,body,size=bodysize,color=WHITE if nv else GREY,lnspc=118,spc_after=4)
            else: text(s,x+0.35,cy,cw-0.6,yy+h-cy-0.15,body,size=bodysize,color=WHITE if nv else GREY,lnspc=125)

def rows(s,items,y=1.8,x0=X0,w=W,h=None,gap=0.12,size=14,num=True,tagw=0):
    n=len(items); h=h or min(0.9,((6.7-y)-gap*(n-1))/n)
    for i,it in enumerate(items):
        yy=y+i*(h+gap)
        rect(s,x0,yy,w,h,CREAM); rect(s,x0,yy,0.06,h,GOLD)
        tx=x0+0.3
        if num:
            text(s,tx,yy,0.6,h,f"{i+1:02d}",size=18,color=GOLD,font="Georgia",anchor="ctr"); tx+=0.75
        if isinstance(it,tuple):
            a,b=it
            text(s,tx,yy,tagw or 2.6,h,a,size=size,color=NAVY,bold=True,anchor="ctr",lnspc=108)
            text(s,tx+(tagw or 2.6)+0.2,yy,w-(tx-x0)-(tagw or 2.6)-0.45,h,b,size=size-1,color=GREY,anchor="ctr",lnspc=115)
        else:
            text(s,tx,yy,w-(tx-x0)-0.3,h,it,size=size,color=NAVY,anchor="ctr",lnspc=115)

def bar(s,txt,y=5.95,h=0.75,tag=None,x0=X0,w=W):
    rect(s,x0,y,w,h,NAVY)
    runs=[]
    if tag: runs.append((tag+"   ",{'color':GOLD,'size':11}))
    runs.append((txt,{}))
    text(s,x0+0.3,y,w-0.6,h,[runs],size=15,color=WHITE,bold=True,anchor="ctr")

def lead(s,txt,y=1.7,w=W,size=16):
    text(s,X0,y,w,0.6,txt,size=size,color=GREY,italic=True,lnspc=120)

AG=[("01","Preliminaries",""),("02","RMF Publications",""),("03","Assessing Risk",""),("04","Managing Risk","")]
def agenda(cur=None,ttl="Overviewing the Framework"):
    s=S(); title(s,ttl)
    gap=0.25; cw=(W-gap)/2; h=2.3
    for i,(n,t,d) in enumerate(AG):
        r,c=divmod(i,2); x=X0+c*(cw+gap); y=1.85+r*(h+gap)
        nv=(cur==i+1)
        if nv: rect(s,x,y,cw,h,NAVY)
        else: rect(s,x,y,cw,h,CREAM)
        rect(s,x,y,0.10,h,GOLD if nv else NAVY); rect(s,x+0.05,y+h,cw-0.05,0.04,LINE)
        text(s,x+0.4,y,1.0,h,n,size=30,color=GOLD,font="Georgia",anchor="ctr")
        text(s,x+1.45,y,cw-1.7,h,t,size=22,color=WHITE if nv else NAVY,bold=True,anchor="ctr")

    return s

def chain_slide():
    s=S(); title(s,"The Risk Chain: How Risk Works")
    nodes=["Threat Agent","Threat","Vulnerability","Assets","Impact","Risk"]
    links=["initiates","exploits","in","causes","resulting in"]
    n=len(nodes); bw=1.5; gapx=(W-n*bw)/(n-1); y=3.6; bh=1.2
    bx=lambda i: X0+i*(bw+gapx)
    for k,(i0,lab) in enumerate([(0,"Likelihood of the threat occurring"),(2,"Likelihood of successful exploitation")]):
        x=bx(i0); w=2*bw+gapx
        rect(s,x,2.45,w,0.55,NAVY)
        text(s,x+0.2,2.45,w-0.3,0.55,[[(f"{k+1}  ",{'color':GOLD,'font':'Georgia','size':16}),(lab,{})]],size=12,color=WHITE,bold=True,anchor="ctr")
        rect(s,x,3.0,w,0.04,GOLD)
    for i,nm in enumerate(nodes):
        x=bx(i); last=(i==n-1)
        rect(s,x,y,bw,bh,NAVY if last else CREAM); rect(s,x,y,bw,0.06,RED if last else GOLD); rect(s,x+0.05,y+bh,bw-0.05,0.04,LINE)
        text(s,x,y,bw,bh,nm,size=15,color=WHITE if last else NAVY,bold=True,align="c",anchor="ctr")
        text(s,x,y+bh+0.15,bw,0.3,f"{i+1:02d}",size=14,color=GOLD,font="Georgia",align="c")
    for i in range(n-1):
        ax=bx(i)+bw
        rect(s,ax+0.08,y+bh/2-0.012,gapx-0.16,0.025,LINE2)
        text(s,ax-0.3,y+bh+0.15,gapx+0.6,0.3,links[i],size=10,color=RED,bold=True,italic=True,align="c")

def strategy_detail(ttl,summary,items,take):
    s=S(); title(s,ttl)
    lead(s,summary,y=1.6,size=15)
    cards(s,items,y=2.35,h=2.95,bodysize=12.5,titlesize=16)
    bar(s,take,y=5.6,h=1.1,tag="KEY TAKEAWAY")

def headline3(ttl,sub,items):
    s=S(); title(s,ttl)
    lead(s,sub,y=1.6,size=15)
    cards(s,[("",None,b) for b in items] if False else [(f"{i+1:02d}","",b) for i,b in enumerate(items)],y=2.4,h=2.9,bodysize=16,titlesize=16)

def stake_ids():
    s=S(); title(s,"Identifying System Stakeholders and Assets")
    cards(s,[("01","Identify risk stakeholders",""),
             ("02","Understand stakeholder information needs",["Senior management","Mission and business process owners","System and information owners","Systems personnel","Risk practitioners"]),
             ("03","Identify stakeholder assets","")],y=1.8,h=4.2,bodysize=14,titlesize=17,navy_idx=(1,))
    return s

# ================= SLIDES 2..60
s=S(); title(s,"Course Goals")
cards(s,[("01","Understanding Risk Management Terminology, Methods and Tools","Grasp the significance of a mature Risk Management process in a business environment shaped by the cyber era."),
         ("02","Acquiring Practical Experience","Gain hands-on proficiency in conducting Risk Assessments, a fundamental and pivotal activity within the Risk Management process.")],
      y=1.9,h=2.8,bodysize=15,titlesize=20)
agenda(None)
# 4
s=S(); title(s,"What Is This All About?")
text(s,X0,1.85,7.8,0.6,"Meet Eugene. He knows things.",size=24,color=NAVY,bold=True,font="Georgia")
bullets(s,X0,2.75,7.8,2.4,["Eugene appears at strategic points in this presentation.","Whenever he appears, we focus on something specific.","Usually a class discussion or a notable example."],size=16,lnspc=125,spc_after=8)
card(s,X0,5.2,7.8,1.0,"cream",stripe="navy")
text(s,X0+0.4,5.2,7.2,1.0,"Let's take a moment to experience a Eugene Moment.",size=15,color=NAVY,bold=True,italic=True,anchor="ctr")
panel_q(s,["Can anyone explain what a RISK is?","Can anyone think of an example of RISK in a cybersecurity context?","Why would anyone (and businesses in particular) care about RISK?"])
# 5
s=S(); title(s,"Why Would Anyone Even Care?")
text(s,X0,2.6,7.8,1.5,"Something to do with the “Goals”",size=30,color=NAVY,italic=True,bold=True,font="Georgia",lnspc=110)
rect(s,X0,4.1,0.8,0.04,GOLD)
panel_q(s,["What is the meaning of “Goals”?","Are “Goals” and “Objectives” the same?"])
# 6
s=S(); title(s,"Why Would Anyone Even Care?")
card(s,X0,1.75,7.9,4.95,"cream")
label(s,X0+0.4,2.0,7,"SOMETHING TO DO WITH THE “GOALS”")
text(s,X0+0.4,2.4,7.2,0.6,"Goals represent reason(s).",size=22,color=NAVY,bold=True)
bullets(s,X0+0.4,3.2,7.2,2.0,["Why are we doing something?","Why are we going on that mission?"],size=16,lnspc=125,spc_after=6)
rect(s,X0+0.4,4.75,0.5,0.02,GOLD)
text(s,X0+0.4,4.9,7.2,1.2,"Evidently, the Goal is the outcome we're expecting to achieve.",size=16,color=RED,bold=True,italic=True)
panel_q(s,["What is the goal of a business?","What are business assets?","What do GOALS have to do with ASSETS?"])
# 7
s=S(); title(s,"A Maze, and a Solution")
label(s,X0,1.65,7,"WE'RE ABOUT TO ENTER A CRUCIAL MAZE")
rows(s,["The goal of the business (the outcome it expects) is maximizing profits (or money).","Business decisions dictate business activities.","Business activities require or produce business assets.","Business assets are significant for achieving business goals.","Compromised business assets are NOT supporting business goals.","If the engines of profits break, we're not achieving the goal."],y=1.95,w=7.9,h=0.52,gap=0.07,size=12.5)
bar(s,"Should we get a map or some guide? Yes. Luckily, it's right here with us: the Risk Management Framework (RMF).",y=5.95,h=0.75,w=7.9)
panel_q(s,["Why would business assets be compromised?","Who should we ask about possible impact?"])
# 8
s=S(); title(s,"Terms and Definitions")
cards(s,[("","Threat Agent","Individuals, groups, or entities that carry out or exploit threats to assets. They are the actors behind potentially harmful events."),
         ("","Threat","Potential events or circumstances that can cause harm or loss to assets. Threats can be natural (e.g., earthquakes) or human-made (e.g., cyberattacks)."),
         ("","Vulnerability","Weaknesses or flaws in a system, process, or asset that a threat can exploit.")],y=1.85,h=4.2,bodysize=15.5,titlesize=22)
# 9
s=S(); title(s,"Let's Try to Define Risk")
cards(s,[("RISK IS ALWAYS AN OUTCOME OF BOTH","A Threat + A Vulnerability",""),
         ("RISK IS A FUNCTION OF LIKELIHOOD AND IMPACT","",["The higher the likelihood, the higher the risk.","The higher the impact, the higher the risk.","Lowering likelihood or impact lowers risk."])],
      y=1.75,cols=1,x0=X0,w=7.9,h=1.9,bodysize=14,titlesize=20)
text(s,X0,6.05,7.9,0.5,"Evidently, risks affect business assets.",size=15,color=RED,bold=True,italic=True)
panel_q(s,["What is the definition of THREAT?","What is the definition of VULNERABILITY?"])
# 10
s=S(); title(s,"Terms and Definitions")
cards(s,[("","Assets","Anything of value to an organization, such as information, systems, equipment, facilities, or personnel."),
         ("","Impact","The extent of harm or loss to an organization if a threat exploits a vulnerability in an asset, such as financial loss, disruption to operations, or damage to reputation.")],y=1.9,h=3.0,bodysize=16,titlesize=22)
# 11
s=S(); title(s,"What Is Risk?")
rect(s,X0,1.75,W,2.6,NAVY); rect(s,X0+0.05,4.35,W-0.05,0.04,LINE2)
text(s,X0+0.4,2.3,W-0.8,1.9,"“A measure of the extent to which an entity is threatened by a potential circumstance or event, and typically is a function of: (i) the adverse impact, or magnitude of harm, that would arise if the circumstance or event occurs; and (ii) the likelihood of occurrence.”",size=16,color=WHITE,italic=True,font="Georgia",lnspc=125)
card(s,X0,4.65,W,2.05,"cream")
text(s,X0+0.4,3.95,W-0.8,0.3,"Source: NIST SP 800-37 Rev. 2 (glossary)",size=10,color=LGOLD,italic=True)
label(s,X0+0.4,4.85,6,"IN PLAIN LANGUAGE")
text(s,X0+0.4,5.2,W-0.8,1.3,"The potential negative consequences to an organization, its assets, or individuals due to vulnerabilities (and the relevant security measures available) in an information system.",size=17,color=NAVY,bold=True,lnspc=122)
# 12
s=S(); title(s,"The “Risk Chain” in the RMF")
rows(s,["Start by identifying assets (what needs to be protected), then assess the vulnerabilities within those assets.",
        "Consider threats and threat agents to determine the likelihood of a threat exploiting a vulnerability and causing harm.",
        "Use the likelihood and impact assessments to calculate the level of risk for specific threats.",
        "Based on the calculated risk, decide which security controls to implement to mitigate or manage the risks.",
        "Goal: reduce the likelihood and impact of threats to an acceptable level, ensuring security and resilience."],y=1.75,h=0.88,size=14)
# 13
chain_slide()
# 14
s=S(); title(s,"Revisiting the Terms: RMF Context")
cards(s,[("","Threat Agent","Understanding threat agents helps in assessing the likelihood of a threat manifesting and the potential impact on assets. It guides security control selection and implementation."),
         ("","Threat","Threats are assessed to determine their potential impact on assets. Threats drive the need for risk assessment and mitigation."),
         ("","Vulnerability","Identifying vulnerabilities within assets is essential in the RMF to understand potential points of weakness that threats could target.")],y=1.85,h=3.5,bodysize=14.5,titlesize=20)
# 15
s=S(); title(s,"Revisiting the Terms: RMF Context")
cards(s,[("","Assets","Assets are what organizations seek to protect through risk management. Identifying and prioritizing assets is a crucial step in assessing risks and implementing appropriate security controls."),
         ("","Impact","Assessing the potential impact is crucial in the RMF to understand the consequences of a security incident. It helps prioritize risk mitigation efforts.")],y=1.9,h=3.0,bodysize=16,titlesize=22)
# 16
s=S(); title(s,"Risk Management Framework: Key Practical Elements")
lead(s,"Is this a “real” thing? Yes. Let us introduce NIST, from the US Department of Commerce.",y=1.6,size=15)
cards(s,[("01","Risk Management","Guidance on how organizations should establish a formalized risk management program."),
         ("02","Risk Assessment","Covers the requirement to assess risk periodically, against a standard."),
         ("03","Risk Response","Helps organizations develop a formalized strategy for responding to risk.")],y=2.4,h=2.8,bodysize=16,titlesize=20)
# 17
s=S(); title(s,"The National Institute of Standards and Technology")
label(s,X0,1.6,7,"THE MAIN TYPES OF NIST INFORMATION SECURITY PUBLICATIONS")
rows(s,[("FIPS","Federal Information Processing Standards. Mandatory standards for all federal agencies."),
        ("SPs","Special Publications. Information security guidelines, recommendations and reference materials."),
        ("NIST IRs","NIST Interagency or Internal Reports. Technical research for a specialized audience."),
        ("ITL Bulletins","Information Technology Laboratory Bulletins (1990-2020). Each focused on a single topic of significant interest."),
        ("CSWP","Cybersecurity White Papers. Shorter guidance, such as the NIST Cybersecurity Framework (CSF) 2.0, published in 2024.")],
     y=1.95,w=8.0,h=0.88,gap=0.1,size=13,num=False,tagw=1.45)
rect(s,8.85,1.95,3.9,4.75,NAVY)
text(s,9.15,2.3,3.35,3.9,"Responsible for “developing standards, guidelines, and associated methods and techniques” for information security programs and the risk management of information systems used or operated by an agency or contractor, excluding national security systems.",size=13.5,color=WHITE,lnspc=125)
# 18
s=S(); title(s,"Overview of the Risk Management Framework")
label(s,X0,1.6,7,"THE RMF HAS THE FOLLOWING CHARACTERISTICS")
rows(s,["Promotes near real-time risk management and ongoing system authorization through robust continuous monitoring.",
        "Encourages automation, so senior leaders get the information they need for cost-effective, risk-based decisions.",
        "Integrates information security into the enterprise architecture and the system development life cycle.",
        "Emphasizes selecting, implementing, assessing and monitoring security controls, and authorizing information systems.",
        "Establishes responsibility and accountability for the security controls deployed in organizational systems."],y=1.95,h=0.85,size=14)
# 19
s=S(); title(s,"The RMF Lifecycle")
steps=[("Prepare","Develop the risk management program"),("Categorize","Systems, based on criticality"),("Select","Security controls"),("Implement","Security controls"),
       ("Assess","Controls and risk"),("Authorize","Accept risk and allow the system to operate"),("Monitor","Changes in risk and the operating environment")]
n=len(steps); gap=0.15; cw=(W-gap*(n-1))/n
for i,(a,b) in enumerate(steps):
    x=X0+i*(cw+gap)
    text(s,x,1.8,cw,0.45,f"{i+1:02d}",size=22,color=GOLD,font="Georgia",align="c")
    rect(s,x,2.35,cw,0.85,NAVY); text(s,x,2.35,cw,0.85,a,size=14,color=WHITE,bold=True,align="c",anchor="ctr")
    rect(s,x,3.2,cw,2.2,CREAM); rect(s,x+0.05,5.4,cw-0.05,0.04,LINE)
    text(s,x+0.15,3.4,cw-0.3,1.9,b,size=13,color=GREY,align="c",lnspc=120)
# 20
agenda(2)
# 21
s=S(); title(s,"NIST: National Institute of Standards and Technology")
card(s,X0,1.75,4.6,4.95,"cream")
label(s,X0+0.35,2.0,4,"THE BEATING HEART OF THE RMF")
text(s,X0+0.35,2.4,3.95,4.0,["NIST publications define the lifecycle we saw earlier.","Among them are standards and guidance that let organizations manage risk effectively through a formal business process."],size=15,color=NAVY,lnspc=125,spc_after=10)
pubs=[("FIPS 199","Categorize"),("NIST SP 800-60","Categorize"),("FIPS 200","Select"),("NIST SP 800-53","Select"),("NIST SP 800 series","Implement"),("NIST SP 800-53A","Assess / Monitor"),("NIST SP 800-37","Authorize"),("NIST SP 800-137","Monitor")]
for i,(a,b) in enumerate(pubs):
    y=1.75+i*0.62
    rect(s,5.4,y,7.35,0.54,CREAM); rect(s,5.4,y,0.06,0.54,GOLD)
    text(s,5.7,y,3.6,0.54,a,size=14,color=NAVY,bold=True,anchor="ctr")
    text(s,9.6,y,3.0,0.54,b.upper(),size=10.5,color=GOLD,bold=True,anchor="ctr",align="r")
# 22
s=S(); title(s,"Publications Overview")
cards(s,[("","NIST RMF is essentially a grouping of several formal publications made by NIST","Together, these publications holistically cover the entire lifecycle of the RMF."),
         ("TRIVIA FACTS ABOUT NIST PUBLICATIONS","",["Numeric references (e.g., SP 800-53) say nothing specific about a publication's contents.","Some may become (or already are) somewhat redundant.","They occasionally refer to one another."])],y=1.85,h=3.4,bodysize=15,titlesize=19)
# 23
agenda(3)
# 24
s=S(); title(s,"What Are We Actually Assessing?")
cards(s,[("01","Control Effectiveness","How well was the goal achieved?"),("02","Risk Evaluation","How is risk affected when a control exists or is absent?"),("03","Compliance","Is there adherence to the necessary compliance and regulation?")],y=1.9,h=2.6,bodysize=17,titlesize=21)
# 25
s=S(); title(s,"Control Effectiveness")
rect(s,X0,1.9,W,1.6,NAVY)
text(s,X0+0.4,1.9,W-0.8,1.6,"Measuring how effective controls are at keeping systems and data protected.",size=22,color=WHITE,bold=True,anchor="ctr")
cards(s,[("FOR EXAMPLE, MEASURE","",["The number of incidents","Vulnerabilities found","Performance","Function"])],y=3.85,h=2.85,bodysize=15,titlesize=18)
# 26
s=S(); title(s,"Risk Measurement")
lead(s,"Measure risk in terms of:",y=1.6)
cards(s,[("01","","The implemented control and its effect on risks."),("02","","The implications of risks in the absence of the control."),("03","","The effect on risks if implemented controls are strengthened.")],y=2.35,h=2.8,bodysize=16,titlesize=20)
# 27
s=S(); title(s,"How to Measure Compliance?")
rows(s,["Compliance is measured against legal and regulatory requirements.","A control is either compliant or non-compliant."],y=1.9,h=1.0,size=17)
bar(s,"Note that compliance, level of protection, and risk are NOT the same things.",y=4.4,h=1.2)
# 28
s=S(); title(s,"Assessing Controls")
cards(s,[("01","Interview","Key personnel"),("02","Observe","Systems in operation"),("03","Review","All documentation"),("04","Test","Perform technical testing on systems")],y=1.9,h=2.4,bodysize=16,titlesize=22,stripe="navy")
# 29
s=S(); title(s,"Interview Key Personnel")
cards(s,[("CONDUCT INTERVIEWS WITH KEY PERSONNEL SUCH AS","",["Senior Security and Privacy Officers","System Administrators","Security Personnel","End Users"]),
         ("THE PURPOSE","Get explanations, direct answers, and clarifying statements. Examples:",["Policies and procedures","Security practices","Documentation","Trends and historical issues"])],y=1.85,h=3.6,bodysize=15,titlesize=17)
# 30
s=S(); title(s,"Observe the System in Operation")
lead(s,"Purpose: observe the security functions, mechanisms and procedures performed by the system and personnel.",y=1.6,size=15)
rows(s,[("BIOS/UEFI protection","Enforcement of BIOS/UEFI firmware protection (access control)"),("Log-on security","Enforcement of log-on security"),("File permissions","Hierarchy and structure of file permissions (least privilege)"),
        ("Patch management","Implications of the patch management process (mean time to patch)"),("Screen lock","Automatic screen lock (session lockout)")],y=2.35,h=0.75,size=14,tagw=2.6)
# 31
s=S(); title(s,"Review All Documentation")
label(s,X0,1.6,7,"REVIEW SYSTEM DOCUMENTATION, INCLUDING")
rows(s,["General and specific assessment reports","Architecture and diagrams (existence of proper system administration)","Security control documentation","Policies, standards and procedures","Security incident reports"],y=1.95,h=0.8,size=15)
# 32
s=S(); title(s,"Perform Technical Testing")
lead(s,"Test the system for vulnerabilities, improper configuration, missing patches and more.",y=1.6,size=15)
cards(s,[("","",["Vulnerability scans","Dump system configuration (registry, permission definitions, log configuration)","Local accounts","Local security policies","Verify patch levels"]),
         ("DIFFERENT ACTIVITIES MAY BE HELPFUL, FOR EXAMPLE","",["Penetration testing","Code review"])],y=2.35,h=3.4,bodysize=15,navy_idx=(1,))
# 33
agenda(4)
# 34
s=S(); title(s,"RMF: A Lighthouse for Risk Management")
rect(s,X0,1.85,W,2.0,NAVY)
text(s,X0+0.4,1.85,W-0.8,2.0,"A structured approach for integrating security, privacy, and risk management activities to safeguard information systems.",size=21,color=WHITE,bold=True,anchor="ctr",lnspc=118)
card(s,X0,4.2,W,2.3,"cream")
text(s,X0+0.4,4.55,W-0.8,1.5,"The formalized program, processes, and procedures an organization uses to assess, respond to, and monitor risk to information systems and data.",size=17,color=NAVY,lnspc=122)
# 35
s=S(); title(s,"Managing Risks")
cards(s,[("01","Monitor Systems and Environment",["Continuously monitor systems and their environment to detect incidents and changes that may compromise business goals.","Use automated tools and manual checks to keep controls effective."]),
         ("02","Assess and Re-Assess",["Regularly assess and re-assess controls to identify vulnerabilities and their potential business impact.","Ongoing assessment keeps risks managed and controls relevant."]),
         ("03","Respond to Risk",["Develop and implement response plans, including incident response plans and mitigation strategies.","Respond swiftly to incidents, breaches or changes in the risk landscape."])],y=1.8,h=4.9,bodysize=13,titlesize=17)
# 36
s=S(); title(s,"Managing Risks")
cards(s,[("04","Update Risk Documents",["Keep risk assessments, mitigation plans and authorization documents current.","Accurate documentation enables informed decisions."]),
         ("05","Report Security and Privacy Status",["Report regularly to senior management, auditors and regulators.","Transparent reporting maintains trust and compliance."]),
         ("06","Maintain Authorization",["Address risks and comply with security controls to keep the authorization to operate.","Review and renew authorization periodically."]),
         ("07","Proper System Disposal",["At end of life, or when risks become unacceptable, dispose of the system securely.","Secure disposal prevents breaches and unauthorized access."])],y=1.8,h=4.9,cols=4,gap=0.2,bodysize=12,titlesize=15)
# 37
s=S(); title(s,"Initiation of Organizational Preparation")
rows(s,["Developing the organizational risk culture","Risk strategy","Risk methodology","Risk policy and procedures","RMF organizational preparation tasks"],y=1.85,h=0.82,size=17)
# 38
s=S(); title(s,"Risk Strategy")
rows(s,["A long-term plan developed by upper management for achieving the organization's mission and goals.","Involves selecting a risk management methodology to determine risk appetite and tolerance.",
        "Usually incorporated into the organization's overall security strategy.","Developed by senior IT/IS personnel (CIO/CISO) in coordination with executive management."],y=1.9,h=1.0,size=15)
# 39
s=S(); title(s,"Risk Strategy")
cards(s,[("01","Focuses on IS risk","Defines how risk affects the organization's strategy and mission."),("02","Directs all risk activities","Provides direction on long-term risk management objectives and activities."),
         ("03","Must be adaptable","Must change as the mission, technology, threats and environment change.")],y=1.9,h=2.8,bodysize=16,titlesize=20)
# 40-42
strategy_detail("Focus on Information Systems Risk","In the RMF, the Risk Strategy places significant emphasis on risks associated with information systems.",
    [("","Information Systems Risk","Information systems include hardware, software, networks and data. Identifying, assessing and mitigating their risks is a critical part of the RMF."),
     ("","Scope","The Risk Strategy defines the scope of risk management efforts: vulnerabilities, threats and impacts specific to information systems.")],
    "Focusing on IS risk tailors security to protect digital assets and maintain confidentiality, integrity and availability.")
strategy_detail("Directing All Risk Activities","The Risk Strategy is the central guiding framework for all risk management activities in an organization.",
    [("01","Coordination","Coordinates risk assessments, control implementation, monitoring and authorization decisions across the organization."),
     ("02","Roles and Responsibilities","Defines roles, responsibilities and decision-making authority, for consistency and accountability."),
     ("03","Alignment with Objectives","Ensures all risk actions align with organizational goals, risk tolerance and compliance requirements.")],
    "The Risk Strategy unifies risk management efforts into one cohesive, strategic approach.")
strategy_detail("Adaptability in Risk Strategy","An effective Risk Strategy must adapt to evolving threats, technologies and organizational changes.",
    [("01","Changing Threat Landscape","Threats are dynamic. The strategy must accommodate changes to address emerging risks effectively."),
     ("02","Ongoing Improvement","Adaptability lets organizations refine practices based on new knowledge and experience."),
     ("EXAMPLE","A new cyber threat emerges","An adaptable strategy lets the organization quickly adjust its mitigation measures and stay resilient.")],
    "Adaptability keeps risk management agile and responsive to evolving challenges.")
# 43
s=S(); title(s,"Risk Strategy")
text(s,X0,1.65,W,0.9,["What are we supposed to do about “risks”?","What dictates a business's ability to “exist” alongside risks?"],size=16,color=GREY,italic=True,lnspc=125)
tiles=["Assessment","Response","Monitoring","Risk Appetite","Risk Tolerance","Methodology"]
gap=0.25; cw=(W-2*gap)/3; h=1.75
for i,t in enumerate(tiles):
    r,c=divmod(i,3); x=X0+c*(cw+gap); y=2.75+r*(h+gap)
    nv=r==1
    rect(s,x,y,cw,h,NAVY if nv else CREAM); rect(s,x,y,0.06,h,GOLD); rect(s,x+0.05,y+h,cw-0.05,0.04,LINE)
    text(s,x,y,cw,h,t,size=20,color=WHITE if nv else NAVY,bold=True,align="c",anchor="ctr")
# 44
s=S(); title(s,"Risk Appetite and Risk Tolerance")
cards(s,[("","Risk Appetite","The organization's level of willingness to endure risk for its business pursuits and projects."),
         ("","Risk Tolerance","The level of variance in risk for a specific business objective that an organization will tolerate beyond its risk appetite.")],y=1.9,h=3.0,bodysize=17,titlesize=24,navy_idx=(1,))
# 45
stake_ids()
# 46
s=S(); title(s,"Who Are the Stakeholders?")
card(s,X0,1.75,7.9,1.55,"cream",stripe="navy")
text(s,X0+0.4,1.75,7.2,1.55,"Individuals, groups, or entities with a vested interest in the security, compliance, and performance of an organization's information systems and the associated risks.",size=14,color=NAVY,anchor="ctr",lnspc=120)
rows(s,["Leadership team","Mission / business process owner","System and data owners","Security engineers, architects and admins","System users"],y=3.5,w=7.9,h=0.56,gap=0.08,size=14)
panel_q(s,["Do you remember what the goal of a business is?","Why is it important to know who the stakeholders are, in light of the Goal?"])
# 47
s=S(); title(s,"How Do We Identify Stakeholders?")
rows(s,["Dissect the core business or mission.","What are the core and supporting processes?","Decompose into functional AND organizational structures.","Identify those leaders, processes, and key information assets."],y=1.9,h=1.0,size=17)
# 48
s=S(); title(s,"What Do Stakeholders Want from Risk Management?")
label(s,X0,1.6,8,"MOST STAKEHOLDERS SHARE A COMMON INTEREST IN")
rows(s,["Risk reduction","Reduced liabilities (when risks are managed reasonably)","Sufficient asset protection, so the GOAL is achieved","Balance between security, functionality and resources, so the GOAL is achieved","Compliance with governance"],y=1.95,h=0.66,gap=0.1,size=15)
bar(s,"Of course, financial fines due to compliance issues are the best example of not achieving the goal.",y=5.95,h=0.75)
# 49
s=S(); title(s,"Ensuring Alignment with Governance Requirements")
label(s,X0,1.6,7,"COMPLIANCE WITH GOVERNANCE")
rows(s,["Risk management should harmonize with industry regulations, standards and organizational governance.","Stakeholders expect risk management to ensure compliance with legal and regulatory mandates.","Risk assessments play a major role in achieving and demonstrating adherence to governance expectations."],y=1.95,w=7.9,h=1.35,size=14)
panel_q(s,["What do Governance, Laws and Compliance have to do with the Goal?"])
# 50-53
headline3("Reduced Risk","Achieving risk reduction through proactive management.",["Stakeholders aim to decrease the likelihood and severity of unwanted events through risk mitigation strategies.","Effective risk management identifies, evaluates and prioritizes risks to minimize potential harm.","Reduced risks contribute to an organization's resilience and stability."])
headline3("Reduced Liability","Minimizing organizational liability through prudent risk management.",["Stakeholders want to limit legal and financial exposure from security incidents or non-compliance.","Adapting risk management practices can reduce legal disputes and financial penalties.","Lower liability strengthens the organization's reputation and financial soundness."])
headline3("Sufficient Asset Protection","Ensuring comprehensive safeguarding of organizational assets.",["Stakeholders expect robust protection for vital assets: data, infrastructure and intellectual property.","Asset protection preserves operational capability and mission fulfillment.","Risk assessments help identify vulnerabilities and suitable protective measures."])
headline3("Balance Between Security, Functionality and Resources","Striking an equilibrium among security, functionality and resource allocation.",["Stakeholders want robust security, seamless functionality and efficient use of resources.","Optimizing security without hurting operations or draining resources is complex.","Skillful risk management finds the balance that fits stakeholder expectations."])
# 54
stake_ids()
# 55
s=S(); title(s,"Decomposing the Organization")
lv=["Organization Structure Breakdown","Functional Structure Breakdown","Business Process","Support Systems","Assets"]
for i,t in enumerate(lv):
    w=W-i*1.6; x=X0+(W-w)/2; y=1.8+i*0.95
    last=i==len(lv)-1
    rect(s,x,y,w,0.8,NAVY if last else CREAM); rect(s,x,y,0.06,0.8,GOLD)
    text(s,x,y,w,0.8,t,size=17,color=WHITE if last else NAVY,bold=True,align="c",anchor="ctr")
    text(s,x+0.25,y,0.8,0.8,f"{i+1:02d}",size=16,color=GOLD,font="Georgia",anchor="ctr")
# 56
s=S(); title(s,"Business Impact Analysis (BIA)")
rect(s,X0,2.1,W,2.6,NAVY); rect(s,X0+0.05,4.7,W-0.05,0.04,LINE2)
label(s,X0+0.5,2.4,6,"DEFINITION")
text(s,X0+0.5,2.8,W-1.0,1.7,"A process that identifies an organization's critical assets and prioritizes them in terms of critical risk, loss, or recovery.",size=24,color=WHITE,bold=True,lnspc=118)
# 57
s=S(); title(s,"Business Impact Analysis")
rows(s,["Decompose into assets that support business processes.","Determine how to group assets as a “system”.","Inventory all assets.","Determine the criticality of assets to a particular business process."],y=1.9,h=1.0,size=17)
# 58
s=S(); title(s,"Business Impact Analysis")
label(s,X0,1.6,7,"LOOK AT CRITICALITY IN TERMS OF")
rows(s,["The revenue the asset contributes to the process","How much the asset is needed to perform a business function","Data type and sensitivity","How the function would suffer if the asset were unavailable","What it would take to restore or replace the asset if lost"],y=1.95,h=0.8,size=15)
# 59
s=S(); title(s,"Business Impact Analysis")
cards(s,[("01","Assign criticality to assets",""),("02","Determine priority","For risk, restoration, replacement, etc."),("03","Start / feed into the categorization process",["Data types","Criticality of system and data in terms of CIA"])],y=1.9,h=3.0,bodysize=15,titlesize=19)
# 60
s=S()
rect(s,0,0,13.333,7.5,NAVY)
text(s,1.0,2.2,11,0.4,"BUS-PM202 UNIT · RISK MANAGEMENT",size=11,color=GOLD,bold=True)
text(s,1.0,2.7,11,1.4,"Thank You",size=54,color=WHITE,bold=True)

for sl in old[1:]: delete_slide(prs,sl)
print("slides",len(prs.slides))
out=OUTD+"GC-PM202_Risk_redesign_FULL.pptx"; prs.save(out); print(out)

# ---- slim: drop unused layouts so the file uploads (<10MB)
prs=Presentation(out)
used={id(s.slide_layout) for s in prs.slides}
for master in prs.slide_masters:
    for lay in list(master.slide_layouts):
        if id(lay) not in used:
            try: master.slide_layouts.remove(lay)
            except Exception as e: print("skip",lay.name,e)
prs.save(out)
import zipfile
z=zipfile.ZipFile(out); big=sorted([(i.file_size,i.filename) for i in z.infolist() if 'media' in i.filename],reverse=True)[:8]; print(big)
print("size MB",os.path.getsize(out)/1e6)
# shrink hidden layout photo (covered by the new cover image) and the cover image
import io, shutil
from PIL import Image as PI
tmp=out+".tmp"
zin=zipfile.ZipFile(out); zout=zipfile.ZipFile(tmp,"w",zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    data=zin.read(it.filename)
    if it.filename.startswith("ppt/media/") and it.filename.endswith(".png") and len(data)>1_500_000:
        im=PI.open(io.BytesIO(data)); im.thumbnail((1600,1600))
        if it.filename=="ppt/media/image1.png": im.thumbnail((300,300))
        b=io.BytesIO(); im.save(b,"PNG",optimize=True); data=b.getvalue()
    zout.writestr(it,data)
zout.close(); zin.close(); shutil.move(tmp,out)
print("final MB",os.path.getsize(out)/1e6)

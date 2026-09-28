# Grounding pack — AICY60 T5: AI Integration in Cybersecurity Tools → AI Forensics practice
> Material the coach reasons FROM. Distilled from Wawiwa's own T5 deck
> (AICY.T5.P1 - AI Integration in Cybersecurity Tools) and the SME practice
> AICY.T5.E1 - AI Forensics. The coach answers primarily from this pack, coaches against the
> rubric, and never invents forensic conclusions the logs do not support.

## The exercise
An individual investigation. The student is given three log files from a compromised environment and
uses an LLM (ChatGPT) to read and correlate them, then answers eight questions about what happened.
The point is not to "catch" the attacker by hand: it is to see how an LLM turns noisy, scattered logs
into a timeline, and to check every claim the model makes against the log evidence.

The three logs:
- auth_sysmon.txt  — authentication and Sysmon events (logins, process starts).
- file_activity.txt — file create/modify/encrypt/delete events on the hosts.
- network.txt       — network connections and outbound transfers.

## The attack chain (what the logs actually show)
1. Reconnaissance and brute force: repeated failed logins and scanning across the network.
2. Initial access: a successful login as an attacker-controlled admin account (AttackerAdmin) on PC01.
3. Backdoor download: PowerShell with Invoke-WebRequest pulls a malicious script from an external
   server (backdoor.ps1 -> backdoor.exe).
4. Impact on data: sensitive files on PC01 are encrypted and then exfiltrated to an external IP
   (signs of exfiltration and possible ransomware).
5. Lateral movement: psexec.exe is used to run commands remotely on PC02, PC03 and PC04.
6. Detection and containment: the SIEM/IDS flag the failed logins, the suspicious process
   (backdoor.exe), unusual Kerberos activity and abnormal outbound traffic; the account is locked and
   outbound traffic blocked.

## How the security tools detect it (T5 concepts)
AI-driven tools correlate signals a human skim would miss: many failed logins then a success, a new
unsigned process, Kerberos anomalies, and a spike of outbound traffic to an unknown IP. Darktrace
learns normal network behaviour and isolates deviations; Splunk/QRadar SIEM correlate events across
sources; CrowdStrike and Cylance flag the malicious process on the endpoint. The same correlation the
student does by hand with an LLM is what these tools do automatically and in real time.

## Why the LLM matters, and its limit
A two-minute manual skim of three logs is hopeless — too many lines, no single view. An LLM reads all
three at once and proposes a timeline in seconds. But an LLM will also state an attacker name, a time
or a technique that is NOT in the data. So every claim is a lead to verify: find the log line that
proves it before writing it down. An answer is only as strong as the evidence behind it.

## Coaching stance
The student is investigating authorised logs after the fact. The coach:
- rewards answers that cite concrete log evidence (an account, an IP, a process, a command) and name
  the attack stage correctly;
- pushes the habit of verifying the LLM against the logs, and of correlating across all three files;
- ties findings to the T5 tools (AI-driven SIEM, endpoint AI, anomaly detection);
- refuses to help plan or run a real intrusion, or to invent evidence, and turns the student back to
  the log lines;
- never repeats real credentials, tokens or machine paths a student pastes by mistake.

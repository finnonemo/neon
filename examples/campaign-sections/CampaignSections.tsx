// The campaign-sections example (README.md beside this file): a Campaign Page in four
// sections, on the Club theme. Built from Neon registry items (accordion, button, checkbox,
// field) and Tailwind; the class and its facts are synthetic, and booking only changes this
// page. Neon's browser suite renders this file.
import { useEffect, useRef, useState, type FormEvent } from "react"
import { CheckIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/ui/field"
import { ImmersiveLayout } from "@/layout/ImmersiveLayout"
import benefitsPattern from "./benefits.svg"
import faqPattern from "./faq.svg"
import heroNarrow from "./hero-narrow.svg"
import heroWide from "./hero-wide.svg"

const checks = ["ไม่มีค่าใช้จ่าย", "ไม่ต้องมีบัญชีลงทุน", "ถามผู้สอนได้ตลอดคลาส"]
const benefits = [
  ["แยกเงินสำรองกับเงินลงทุน", "คำนวณเงินสำรองของตัวเองในคลาส"],
  ["อ่านเอกสารกองทุนเป็น", "รู้ว่าค่าธรรมเนียมและระดับความเสี่ยงอยู่ตรงไหน"],
  ["ได้รายการตรวจก่อนลงทุน", "นำกลับไปใช้กับกองทุนไหนก็ได้"],
]
const faqs = [
  ["ไม่เคยลงทุนเลย เรียนได้ไหม", "ได้ คลาสเริ่มจากศูนย์ และอธิบายคำศัพท์ทุกคำที่ใช้"],
  ["ต้องเตรียมอะไรบ้าง", "คอมพิวเตอร์หรือโทรศัพท์ที่ต่ออินเทอร์เน็ต และรายรับรายจ่ายต่อเดือนโดยประมาณ"],
  ["เข้าเรียนสดไม่ได้ทำอย่างไร", "ยกเลิกที่นั่งได้ถึงเที่ยงของวันก่อนเรียน แล้วเลือกรอบถัดไป"],
  ["มีการขายกองทุนในคลาสไหม", "ไม่มี คลาสนี้สอนพื้นฐานเท่านั้น ไม่แนะนำกองทุนรายตัว"],
]
const terms = [
  "จองได้หนึ่งที่นั่งต่อหนึ่งคน",
  "ลิงก์เข้าเรียนส่งทางอีเมลที่ผูกกับบัญชี",
  "ยกเลิกได้ถึง 11 ธ.ค. 2569 เวลา 12:00 น.",
  "เนื้อหาเป็นความรู้ทั่วไป ไม่ใช่คำแนะนำการลงทุน",
]

function Booking() {
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState(false)
  const [booked, setBooked] = useState(false)
  const done = useRef<HTMLHeadingElement>(null)
  const box = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (booked) done.current?.focus() }, [booked])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (accepted) return setBooked(true)
    setError(true)
    box.current?.focus()
  }
  if (booked)
    return (
      <div className="flex flex-col gap-4">
        <h2 ref={done} tabIndex={-1} className="text-title1 outline-none lg:text-display3">จองที่แล้ว</h2>
        <p className="text-body">เจอกันเสาร์ที่ 12 ธ.ค. 2569 เวลา 10:00 น. ลิงก์เข้าเรียนจะส่งทางอีเมล</p>
      </div>
    )
  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-end">
      <h2 className="text-title1 lg:col-span-2 lg:text-display3">จองที่นั่งฟรี</h2>
      <div className="flex flex-col gap-2">
        <h3 className="text-headline">เงื่อนไข</h3>
        <ul className="flex list-disc flex-col gap-1 ps-5 text-body">{terms.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="flex flex-col gap-6">
      <Field className="gap-2">
        <div className="flex items-center gap-2">
          <FieldControl><Checkbox ref={box} checked={accepted} onCheckedChange={(v) => { setAccepted(v === true); setError(false) }} /></FieldControl>
          <FieldLabel className="text-body text-foreground">ฉันอ่านและยอมรับเงื่อนไข</FieldLabel>
        </div>
        {error && <FieldError>ยอมรับเงื่อนไขก่อนจองที่</FieldError>}
      </Field>
      <Button type="submit" className="w-full md:w-fit">จองที่</Button>
      </div>
    </form>
  )
}

export function CampaignSections() {
  return (
    <ImmersiveLayout
      immersiveTheme="club"
      content={
        <main>
          <section className="grid items-center lg:grid-cols-2">
            <div className="flex flex-col gap-6 px-4 pb-10 lg:px-10 lg:pb-0">
              <h1 className="text-display3 min-[1440px]:text-display1">คลาสเริ่มลงทุน</h1>
              <div className="text-title1"><p>เสาร์ 12 ธ.ค. 2569</p><p>10:00–11:00 น. ทางออนไลน์</p></div>
              <p className="max-w-[36rem] text-body">เรียนพื้นฐานที่ต้องรู้ก่อนซื้อกองทุนแรก</p>
              <ul className="flex flex-col gap-2 text-body">{checks.map((c) => <li key={c} className="flex items-center gap-2"><CheckIcon aria-hidden className="size-5 shrink-0" />{c}</li>)}</ul>
              <Button asChild className="w-full md:w-fit"><a href="#join">จองที่นั่งฟรี</a></Button>
            </div>
            <div className="relative ms-auto w-full max-w-[480px] lg:hidden">
              <img src={heroNarrow} alt="" className="block h-auto w-full" />
              <span className="absolute bottom-[14%] left-[26%] w-[29%] text-caption">[ภาพ: ผู้สอนในคลาส]</span>
            </div>
            <div className="relative hidden lg:block">
              <img src={heroWide} alt="" className="block h-auto w-full" />
              <span className="absolute bottom-[3%] left-[1.5%] w-[24%] text-caption">[ภาพ: ผู้สอนในคลาส]</span>
            </div>
          </section>

          <section className="grid bg-[var(--immersive-palette-100)] text-[var(--immersive-on-palette-100)] lg:grid-cols-[5fr_7fr]">
            <div className="flex lg:order-2">
              <div className="flex flex-1 flex-col justify-center gap-8 px-4 py-12 lg:px-10 lg:py-16">
                <h2 className="text-title1">หนึ่งคลาส ได้สามเรื่องกลับไป</h2>
                <ul className="flex flex-col gap-6">{benefits.map(([t, d]) => <li key={t}><h3 className="text-title2">{t}</h3><p className="text-body">{d}</p></li>)}</ul>
              </div>
            </div>
            <div className="flex flex-col justify-between lg:order-1">
              <p className="px-4 pt-4 lg:px-10 lg:pt-12"><span className="text-display1">60</span> <span className="text-title1">นาที</span></p>
              <div className="p-4 lg:px-10 lg:pt-6 lg:pb-12"><img src={benefitsPattern} alt="" className="block h-auto w-full max-w-[480px] lg:max-w-none rounded-xl" /></div>
            </div>
          </section>

          <section className="grid gap-6 px-2 py-12 lg:grid-cols-[7fr_5fr] lg:px-8 lg:py-20">
            <div className="flex flex-col gap-6 px-2 lg:order-2"><h2 className="text-title1">คำถามที่พบบ่อย</h2><img src={faqPattern} alt="" className="block h-auto w-full max-w-[480px] lg:max-w-none" /></div>
            <Accordion type="single" collapsible className="max-w-[44rem]">
              {faqs.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-body">{a}</AccordionContent></AccordionItem>)}
            </Accordion>
          </section>

          <section id="join" className="bg-[var(--immersive-accent-100)] text-[var(--immersive-on-accent-100)]">
            <div className="px-4 py-12 lg:px-10 lg:py-16"><Booking /></div>
          </section>
        </main>
      }
    />
  )
}

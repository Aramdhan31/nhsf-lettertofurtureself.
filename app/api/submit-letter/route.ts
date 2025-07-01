import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import jsPDF from "jspdf"
import fs from 'fs'
import path from 'path'

const resend = new Resend("re_fZbNLMqQ_an9UohASueiizCNMWT7jPMSg")

export async function POST(request: NextRequest) {
  try {
    const letterData = await request.json()

    // Generate PDF
    const generatePDFBuffer = () => {
      const doc = new jsPDF()
      
      try {
        // Try to load the actual NHSF logo
        const logoPath = path.join(process.cwd(), 'public', 'NHSFLOGO.png')
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath)
          const logoBase64 = logoBuffer.toString('base64')
          const logoData = `data:image/png;base64,${logoBase64}`
          
          // Add the actual logo
          const logoWidth = 20
          const logoHeight = 20
          const logoX = (doc.internal.pageSize.width - logoWidth) / 2
          doc.addImage(logoData, 'PNG', logoX, 15, logoWidth, logoHeight)
        } else {
          // Fallback to placeholder
          const logoWidth = 16
          const logoHeight = 16
          const logoX = (doc.internal.pageSize.width - logoWidth) / 2
          doc.setFillColor(139, 69, 19)
          doc.rect(logoX, 15, logoWidth, logoHeight, 'F')
          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(255, 255, 255)
          doc.text("NHSF", doc.internal.pageSize.width / 2, 25, { align: "center" })
        }
      } catch (error) {
        console.error('Error loading logo:', error)
        // Fallback to placeholder
        const logoWidth = 16
        const logoHeight = 16
        const logoX = (doc.internal.pageSize.width - logoWidth) / 2
        doc.setFillColor(139, 69, 19)
        doc.rect(logoX, 15, logoWidth, logoHeight, 'F')
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(255, 255, 255)
        doc.text("NHSF", doc.internal.pageSize.width / 2, 25, { align: "center" })
      }
      
      // Header
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('National Hindu Student Forum', 105, 45, { align: 'center' });
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text('Letter of Reflection & Future Vision', 105, 60, { align: 'center' });
      
      // Date
      doc.setFontSize(11)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
      
      // Greeting
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Dear Future ${letterData.senderName},`, 20, 100);
      
      let yPosition = 120;
      
      // Questions and answers
      const questions = [
        { label: 'How you\'re feeling as a new committee member:', value: letterData.feelings },
        { label: 'One event you\'re excited to organise:', value: letterData.excitedEvent },
        { label: 'One change or improvement you want to bring to your society:', value: letterData.changeImprovement },
        { label: 'One Dharmic value you want to embody:', value: letterData.dharmicValue }
      ];
      
      questions.forEach((q) => {
        if (q.value) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.text(q.label, 20, yPosition)
          yPosition += 10
          
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          const lines = doc.splitTextToSize(q.value, 170)
          lines.forEach((line: string) => {
            doc.text(line, 20, yPosition)
            yPosition += 7
          })
          yPosition += 10
        }
      });
      
      if (letterData.additionalThoughts.trim()) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Additional thoughts and reflections:', 20, yPosition)
        yPosition += 10
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(letterData.additionalThoughts, 170)
        lines.forEach((line: string) => {
          doc.text(line, 20, yPosition)
          yPosition += 7
        })
        yPosition += 10
      }
      
      // Signature
      yPosition += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`Sincerely,`, 20, yPosition)
      yPosition += 15
      doc.setFont('helvetica', 'bold')
      doc.text(letterData.senderName, 20, yPosition)
      yPosition += 8
      doc.setFont('helvetica', 'normal')
      doc.text(letterData.position, 20, yPosition)
      yPosition += 8
      doc.text(letterData.chapter, 20, yPosition)
      
      // Footer
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('National Hindu Student Forum - Reflection Letter', 105, 280, { align: 'center' })

      return doc.output("arraybuffer")
    }

    // Create the letter HTML content (matching the preview exactly)
    const letterHTML = `
      <div style="max-width: 800px; margin: 0 auto; background-color: white; padding: 32px; font-family: serif;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #9a3412; margin-bottom: 8px;">National Hindu Student Forum</h1>
          <h2 style="font-size: 18px; color: #6b7280;">Letter of Reflection & Future Vision</h2>
        </div>

        <div style="margin-bottom: 24px;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
            Date: ${new Date().toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <p style="font-weight: 600; margin-bottom: 24px;">
            Dear Future ${letterData.senderName},
          </p>
        </div>

        <div style="line-height: 1.6; color: #374151;">
          <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 8px;">How you're feeling as a new committee member:</p>
            <p style="padding-left: 16px;">${letterData.feelings}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 8px;">One event you're excited to organise:</p>
            <p style="padding-left: 16px;">${letterData.excitedEvent}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 8px;">One change or improvement you want to bring to your society:</p>
            <p style="padding-left: 16px;">${letterData.changeImprovement}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 8px;">One Dharmic value you want to embody:</p>
            <p style="padding-left: 16px;">${letterData.dharmicValue}</p>
          </div>

          ${
            letterData.additionalThoughts.trim()
              ? `
          <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 8px;">Additional thoughts and reflections:</p>
            <p style="padding-left: 16px;">${letterData.additionalThoughts}</p>
          </div>
          `
              : ""
          }
        </div>

        <div style="margin-top: 32px;">
          <p style="margin-bottom: 16px;">With determination and hope,</p>
          <p style="font-weight: 600;">${letterData.senderName}</p>
          ${letterData.chapter ? `<p style="color: #6b7280;">${letterData.chapter}</p>` : ""}
        </div>

        <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280; font-style: italic;">
            National Hindu Student Forum - Celebrating Impact & Shaping the Future
          </p>
        </div>
      </div>
    `

    // Generate PDF buffer
    const pdfBuffer = generatePDFBuffer()

    // Create filename
    const filename = `NHSF_Letter_to_Future_Self_${letterData.senderName.replace(/\s+/g, "_")}.pdf`

    // Email to admin with PDF attachment
    const adminEmail = await resend.emails.send({
      from: "NHSF Letters <onboarding@resend.dev>",
      to: ["arjun.ramdhan.nhsf@gmail.com"],
      subject: `New NHSF Letter Submission from ${letterData.senderName}`,
      html: `
        <h2>New Letter Submission</h2>
        <p><strong>From:</strong> ${letterData.senderName}</p>
        <p><strong>Chapter:</strong> ${letterData.chapter}</p>
        <p><strong>Letter Type:</strong> Future Self</p>
        
        <hr style="margin: 20px 0;">
        <h3>Letter Content:</h3>
        ${letterHTML}
      `,
      attachments: [
        {
          filename: filename,
          content: Buffer.from(pdfBuffer),
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

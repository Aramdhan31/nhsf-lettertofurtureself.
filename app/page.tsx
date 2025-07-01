"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, FileText, Mail } from "lucide-react"
import jsPDF from "jspdf"

interface LetterData {
  senderName: string
  position: string
  feelings: string
  excitedEvent: string
  changeImprovement: string
  dharmicValue: string
  additionalThoughts: string
  chapter: string
}

export default function NHSFLetterTemplate() {
  const [letterData, setLetterData] = useState<LetterData>({
    senderName: "",
    position: "",
    feelings: "",
    excitedEvent: "",
    changeImprovement: "",
    dharmicValue: "",
    additionalThoughts: "",
    chapter: "",
  })

  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof LetterData, value: string) => {
    setLetterData((prev) => ({ ...prev, [field]: value }))
  }

  const submitLetter = async () => {
    try {
      const response = await fetch("/api/submit-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(letterData),
      })

      if (response.ok) {
        alert("Letter submitted successfully!")
      } else {
        alert("Failed to submit letter. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting letter:", error)
      alert("Failed to submit letter. Please try again.")
    }
  }

  const generatePDF = async () => {
    const doc = new jsPDF()
    
    try {
      // Load the actual NHSF logo
      const response = await fetch('/NHSFLOGO.png')
      const blob = await response.blob()
      const reader = new FileReader()
      
      reader.onload = function() {
        const logoData = reader.result as string
        
        // Add the actual logo
        const logoWidth = 20
        const logoHeight = 20
        const logoX = (doc.internal.pageSize.width - logoWidth) / 2
        doc.addImage(logoData, 'PNG', logoX, 15, logoWidth, logoHeight)
        
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
        
        const filename = `NHSF_Letter_to_Future_Self_${letterData.senderName.replace(/\s+/g, "_")}.pdf`
        doc.save(filename)
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error loading logo:', error)
      // Fallback to placeholder if logo fails to load
      generatePDFWithPlaceholder()
    }
  }

  const generatePDFWithPlaceholder = () => {
    const doc = new jsPDF()
    
    // Logo placeholder - centered
    const logoWidth = 16
    const logoHeight = 16
    const logoX = (doc.internal.pageSize.width - logoWidth) / 2
    
    // Add a simple logo placeholder
    doc.setFillColor(139, 69, 19) // Saddle brown
    doc.rect(logoX, 15, logoWidth, logoHeight, 'F')
    
    // Add "NHSF" text over the logo placeholder
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255) // White text
    doc.text("NHSF", doc.internal.pageSize.width / 2, 25, { align: "center" })
    
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
    
    const filename = `NHSF_Letter_to_Future_Self_${letterData.senderName.replace(/\s+/g, "_")}.pdf`
    doc.save(filename)
  }

  const isFormValid = () => {
    return (
      letterData.senderName.trim() &&
      letterData.position.trim() &&
      letterData.chapter.trim() &&
      letterData.feelings.trim() &&
      letterData.excitedEvent.trim() &&
      letterData.changeImprovement.trim() &&
      letterData.dharmicValue.trim()
    )
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)} className="bg-white w-full sm:w-auto">
              ← Back to Edit
            </Button>
            <Button onClick={generatePDF} disabled={!isFormValid()} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                {/* Actual NHSF Logo */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src="/NHSFLOGO.png" 
                    alt="NHSF Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-800 flex items-center justify-center rounded-md hidden"
                    style={{ backgroundColor: '#8B4513' }}
                  >
                    <span className="text-white font-bold text-xs sm:text-sm">NHSF</span>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-orange-800 mb-2">National Hindu Student Forum</h1>
                <h2 className="text-base sm:text-lg text-gray-600">Letter of Reflection & Future Vision</h2>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Date:{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <p className="font-semibold mb-6">
                  Dear Future {letterData.senderName || "[Your name]"},
                </p>
              </div>

              <div className="space-y-6 text-gray-800 leading-relaxed">
                <div>
                  <p className="font-semibold mb-2">How you're feeling as a new committee member:</p>
                  <p className="pl-4">{letterData.feelings || "[To be filled]"}</p>
                </div>

                <div>
                  <p className="font-semibold mb-2">One event you're excited to organise:</p>
                  <p className="pl-4">{letterData.excitedEvent || "[To be filled]"}</p>
                </div>

                <div>
                  <p className="font-semibold mb-2">One change or improvement you want to bring to your society:</p>
                  <p className="pl-4">{letterData.changeImprovement || "[To be filled]"}</p>
                </div>

                <div>
                  <p className="font-semibold mb-2">One Dharmic value you want to embody:</p>
                  <p className="pl-4">{letterData.dharmicValue || "[To be filled]"}</p>
                </div>

                {letterData.additionalThoughts.trim() && (
                  <div>
                    <p className="font-semibold mb-2">Additional thoughts and reflections:</p>
                    <p className="pl-4">{letterData.additionalThoughts}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <p className="mb-4">Sincerely,</p>
                <p className="font-semibold">{letterData.senderName || "[Your name]"}</p>
                {letterData.position && <p className="text-gray-600">{letterData.position}</p>}
                {letterData.chapter && <p className="text-gray-600">{letterData.chapter}</p>}
              </div>

              <div className="text-center mt-12 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 italic">
                  National Hindu Student Forum - Reflection Letter
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          {/* NHSF Logo */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="/NHSFLOGO.png" 
              alt="NHSF Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-800 flex items-center justify-center rounded-md hidden"
              style={{ backgroundColor: '#8B4513' }}
            >
              <span className="text-white font-bold text-sm sm:text-base">NHSF</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4 gap-2">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-800">NHSF Letter Template</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Create your letter of reflection and future vision</p>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-800">Letter Details</CardTitle>
            <CardDescription>Fill in the template to create your personalized letter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="sender-name">Your Full Name *</Label>
                <Input
                  id="sender-name"
                  value={letterData.senderName}
                  onChange={(e) => handleInputChange("senderName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="position">Your Position *</Label>
                <Input
                  id="position"
                  value={letterData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Enter your position (e.g., President, Secretary, etc.)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="chapter">Your Chapter *</Label>
              <Input
                id="chapter"
                value={letterData.chapter}
                onChange={(e) => handleInputChange("chapter", e.target.value)}
                placeholder="Enter your chapter name (e.g., KCL, UCL, LSE, etc.)"
              />
            </div>

            <div>
              <Label htmlFor="feelings">How you're feeling as a new committee member... *</Label>
              <Textarea
                id="feelings"
                value={letterData.feelings}
                onChange={(e) => handleInputChange("feelings", e.target.value)}
                placeholder="Share your emotions, excitement, nervousness, hopes as you start this journey..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="excited-event">One event you're excited to organise... *</Label>
              <Textarea
                id="excited-event"
                value={letterData.excitedEvent}
                onChange={(e) => handleInputChange("excitedEvent", e.target.value)}
                placeholder="Describe an event or activity you'd love to plan and why it excites you..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="change-improvement">One change or improvement you want to bring to your society... *</Label>
              <Textarea
                id="change-improvement"
                value={letterData.changeImprovement}
                onChange={(e) => handleInputChange("changeImprovement", e.target.value)}
                placeholder="What positive change would you like to see? How can you make your society better..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="dharmic-value">One Dharmic value you want to embody... *</Label>
              <Textarea
                id="dharmic-value"
                value={letterData.dharmicValue}
                onChange={(e) => handleInputChange("dharmicValue", e.target.value)}
                placeholder="e.g., seva (service), satya (truth), karuna (compassion), dharma (righteousness), ahimsa (non-violence)..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="additional-thoughts">Additional thoughts and reflections (Optional)</Label>
              <Textarea
                id="additional-thoughts"
                value={letterData.additionalThoughts}
                onChange={(e) => handleInputChange("additionalThoughts", e.target.value)}
                placeholder="Any other thoughts, quotes, or reflections you'd like to include..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                onClick={() => setShowPreview(true)}
                disabled={!isFormValid()}
                variant="outline"
                className="flex-1 w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Letter
              </Button>

              <Button
                onClick={submitLetter}
                disabled={!isFormValid()}
                className="flex-1 w-full bg-green-600 hover:bg-green-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Submit Letter
              </Button>

              <Button
                onClick={generatePDF}
                disabled={!isFormValid()}
                className="flex-1 w-full bg-orange-600 hover:bg-orange-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {!isFormValid() && (
              <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
                * Please fill in all required fields to preview or download your letter
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

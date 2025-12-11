
export async function pdfToText(file: File) {

    const bytes = await  file.bytes()
    // Dynamically import pdf-parse to avoid SSR issues
    const {PDFParse} =  await import("pdf-parse");
    // Extract text
    const data = new PDFParse(bytes);
    const extractedData = await  data.getText()
    const textList: string[] = []
    extractedData.pages.forEach(page => {
        textList.push(page.text)
    })

    return textList

}
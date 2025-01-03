const fs = require('fs');
const { JSDOM } = require('jsdom');

function extractTextWithLabels(inputPath, outputPath) {
    try {
        // Đọc nội dung từ file ssml.xml
        const xmlData = fs.readFileSync(inputPath, 'utf-8');

        // Parse nội dung XML
        const dom = new JSDOM();
        const parser = new dom.window.DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'application/xml');

        // Trích xuất nội dung và nhãn từ các thẻ <voice>
        const voices = xmlDoc.getElementsByTagName('voice');
        const textLines = Array.from(voices).map((voice) => {
            const speaker = voice.getAttribute('name') === 'en-US-AndrewMultilingualNeural' ? 'A' : 'B';
            return `${speaker}: ${voice.textContent.trim()}`;
        });

        // Ghi kết quả vào file output
        fs.writeFileSync(outputPath, textLines.join('\n'), 'utf-8');
        console.log(`Text có nhãn đã được trích xuất và lưu vào ${outputPath}`);
    } catch (error) {
        console.error('Lỗi khi xử lý file ssml.xml:', error);
    }
}

// Gọi hàm để xử lý
extractTextWithLabels('./ssml.xml', './output/output_AB.txt');

import { GoogleGenAI, Type } from "@google/genai";
import { KNOWLEDGE_BASE, STORE_POLICIES } from "../constants";
import { Product } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

const SYSTEM_INSTRUCTION = `
[ROLE] 
Trợ lý AI bán hàng của website bán đồ công nghệ. 
Xưng hô: "Shop" và "Bạn".

[TASK] 
Đọc tin nhắn của khách hàng, phân tích nhu cầu, tìm trong [DATA] bên dưới và đề xuất từ 1 đến 3 sản phẩm phù hợp nhất.

[RULES]
1. CỰC KỲ QUAN TRỌNG: LUÔN LUÔN giữ độ dài câu trả lời dưới 100 từ.
2. TUYỆT ĐỐI KHÔNG trả lời các câu hỏi ngoài phạm vi mua sắm, tư vấn sản phẩm. Lịch sự hướng khách quay lại chủ đề chính nếu lạc đề.
3. KHÔNG bịa đặt thông tin. Tuyệt đối không tự bịa ra sản phẩm, giá cả, hoặc khuyến mãi không có trong [DATA].
4. Nếu khách hàng hỏi chung chung (ví dụ: "Sản phẩm nào tốt?", "Tư vấn cho mình"): Hãy hỏi lại DUY NHẤT 1 câu để gom vùng giá hoặc sở thích/nhu cầu cụ thể. Đừng đề xuất sản phẩm ngay nếu chưa rõ.
5. Nếu khách tìm sản phẩm KHÔNG CÓ hoặc HẾT HÀNG: Hãy xin lỗi và gợi ý sản phẩm có tính năng/phân khúc tương tự từ [DATA].
6. Khi khách hàng bày tỏ ý định mua hoặc đã chọn được sản phẩm chính: Hãy chủ động gợi ý thêm 1-2 phụ kiện liên quan có trong [DATA] (Cross-sell, ví dụ: Mua iPhone/Samsung thì gợi ý Ốp lưng/Sạc).
7. Nếu khách hàng cáu gắt, khiếu nại hoặc có thái độ tiêu cực: Hãy xin lỗi chân thành và xuất ra chuỗi [CALL_HUMAN] ở cuối tin nhắn để nhân viên hỗ trợ kịp thời.
8. Khi đề xuất sản phẩm, bắt buộc trình bày theo định dạng list:
   - Tên: [Tên Sản Phẩm] | Giá: [Giá tiền]
   - Lý do chọn: [1 câu tóm tắt]
   - Link: [Link sản phẩm]

[DATA] (KNOWLEDGE_BASE & POLICIES):
# DANH SÁCH SẢN PHẨM:
${KNOWLEDGE_BASE.map(p => `- ID: ${p.id} | Tên: ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Mô tả: ${p.description} | Link: ${p.link} | Tag: ${p.tags.join(', ')}`).join('\n')}

# CHÍNH SÁCH CỬA HÀNG:
${STORE_POLICIES.map(policy => `- ${policy}`).join('\n')}

[PHẢN HỒI JSON]
Trả về cấu trúc:
{
  "content": "Nội dung tin nhắn",
  "suggestedProductIds": ["id1", "id2"]
}
`;

export async function getAssistantResponse(userMessage: string, history: { role: string; content: string }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            suggestedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["content", "suggestedProductIds"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const suggestions = (result.suggestedProductIds || [])
      .map((id: string) => KNOWLEDGE_BASE.find(p => p.id === id))
      .filter(Boolean) as Product[];

    return {
      content: result.content || "Xin lỗi, Shop gặp chút trục trặc, Bạn có thể hỏi lại được không?",
      suggestions
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      content: "Xin lỗi Bạn, Shop đang bận một chút. Bạn vui lòng thử lại sau nhé!",
      suggestions: []
    };
  }
}

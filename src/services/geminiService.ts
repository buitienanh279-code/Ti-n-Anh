import { GoogleGenAI, Type } from "@google/genai";
import { KNOWLEDGE_BASE, STORE_POLICIES } from "../constants";
import { Product } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// Helper to get active products from localStorage, falling back to KNOWLEDGE_BASE
function getActiveProducts(): Product[] {
  try {
    const saved = localStorage.getItem('remix_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          description: p.description || p.name,
          imageUrl: p.imageUrl || `https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400`,
          category: p.category,
          tags: p.tags || [p.category.toLowerCase()],
          link: p.link || `https://ais.studio/${p.id.toLowerCase()}`,
          rating: p.rating || 4.8,
          reviews: p.reviews || 120,
        }));
      }
    }
  } catch (e) {
    console.error("Failed to parse remix_products", e);
  }
  
  // Transition fallback: if remix_products is empty, try remix_product_list
  try {
    const savedOld = localStorage.getItem('remix_product_list');
    if (savedOld) {
      const parsedOld = JSON.parse(savedOld);
      if (Array.isArray(parsedOld) && parsedOld.length > 0) {
        return parsedOld.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          description: p.description || p.name,
          imageUrl: p.imageUrl || `https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400`,
          category: p.category,
          tags: p.tags || [p.category.toLowerCase()],
          link: p.link || `https://ais.studio/${p.id.toLowerCase()}`,
          rating: p.rating || 4.8,
          reviews: p.reviews || 120,
        }));
      }
    }
  } catch (e) {
    console.error("Failed to parse remix_product_list", e);
  }

  // Final fallback to constants.ts KNOWLEDGE_BASE
  return KNOWLEDGE_BASE;
}

function getSystemInstruction(products: Product[]): string {
  // Safe localStorage fetch for custom AI prompt configured in Admin Settings
  let customPrompt = "";
  let aiMaxProducts = 3;
  let aiResponseLength = 2; // 1 = Ngắn, 2 = Vừa, 3 = Dài
  let aiUpsell = true;
  let aiSuggestOtherBranches = true;
  const lang = (typeof window !== 'undefined' ? localStorage.getItem('remix_lang') : 'vi') || 'vi';

  try {
    if (typeof window !== 'undefined') {
      const settingsStr = localStorage.getItem('remix_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.systemPrompt !== undefined) customPrompt = settings.systemPrompt;
        if (settings.aiMaxProducts !== undefined) aiMaxProducts = parseInt(settings.aiMaxProducts, 10);
        if (settings.aiResponseLength !== undefined) aiResponseLength = parseInt(settings.aiResponseLength, 10);
        if (settings.aiUpsell !== undefined) aiUpsell = settings.aiUpsell !== false && settings.aiUpsell !== 'false';
        if (settings.aiSuggestOtherBranches !== undefined) aiSuggestOtherBranches = settings.aiSuggestOtherBranches !== false && settings.aiSuggestOtherBranches !== 'false';
      } else {
        customPrompt = localStorage.getItem('remix_ai_system_prompt') || "";
        
        const savedMaxProd = localStorage.getItem('remix_ai_max_products');
        if (savedMaxProd) aiMaxProducts = parseInt(savedMaxProd, 10);

        const savedLength = localStorage.getItem('remix_ai_response_length');
        if (savedLength) aiResponseLength = parseInt(savedLength, 10);

        const savedUpsell = localStorage.getItem('remix_ai_upsell');
        if (savedUpsell !== null) aiUpsell = savedUpsell !== 'false';

        const savedBranches = localStorage.getItem('remix_ai_suggest_other_branches');
        if (savedBranches !== null) aiSuggestOtherBranches = savedBranches !== 'false';
      }
    }
  } catch (e) {
    console.error("Failed to read dynamic AI settings from remix_settings", e);
  }

  if (lang === 'en') {
    const roleText = customPrompt || `You are an extraordinary, highly motivated and helpful AI Sales Assistant at TechShop REMIX. Address yourself as "Shop" or "We" and the customer as "You". ALWAYS compose your conversation and responses in English.`;

    let lengthGuideline = "";
    if (aiResponseLength === 1) {
      lengthGuideline = "EXTREMELY IMPORTANT: Keep response extremely short, concise, under 50 words, and directly to the point.";
    } else if (aiResponseLength === 3) {
      lengthGuideline = "The response can be detailed, comprehensive, up to 250 words if necessary.";
    } else {
      lengthGuideline = "EXTREMELY IMPORTANT: Keep the response length moderate, under 120 words.";
    }

    const upsellGuideline = aiUpsell 
      ? "When the customer chooses a key product or shows severe purchase intent: Proactively recommend 1 relevant accessory or service included in [DATA] (e.g., if we recommend a Laptop, offer laptop sleeves or mice; if a phone, offer charge adapters or screen protectors)."
      : "Focus strictly on answering customer requests. AVOID cross-promotions or trying to cross-sell accessories unless requested.";

    const branchGuideline = aiSuggestOtherBranches
      ? "If the requested product is out of stock in this branch: Search for other active branches in [DATA] and proactively advise the customer to buy from available branches."
      : "If the requested product is entirely out of stock: Gently inform them and suggest close alternative counterparts of similar categories.";

    return `
[ROLE_AND_SYSTEM_INSTRUCTION]
${roleText}

[TASK] 
Read customer messages, analyze their tech needs, find in the [DATA] product catalog below, and propose 1 to ${aiMaxProducts} best-matching products.

[RULES]
1. ${lengthGuideline}
2. ABSOLUTELY DO NOT answer questions beyond shopping or product consultancy. If off-topic, reply with content: "I can only assist you with product consultation and shopping at TechShop. How can I help you in our store?" and status: "out-of-scope".
3. DO NOT fabricate information. Never invent products, prices, specifications, or deals not present in the [DATA].
4. Especially when consulting Laptop: MUST recommend 2 to 3 different laptop products from [DATA] based on their rating and reviews.
5. If the customer's query is vague (e.g. "which specs are nice?", "advise me please"): Ask exactly ONE clarifying question to target their budget or usage purpose first. Do not blindly propose before clarifying.
6. If the product is not found or out of stock: ${branchGuideline} If nothing matches at all, return content: "I couldn't find a matching product matching your requirement. Could you describe your needs in more detail?" and empty suggestedProductIds: [].
7. ${upsellGuideline}
8. If the customer is angry or expresses frustration: apologize sincerely and append [CALL_HUMAN] at the absolute end of the message to alert support personnel.
9. When recommending products, you MUST style them strictly as a list in English layout:
   - Name: [Product Name] | Price: [Price]
   - Reason: [1 sentence summarizing based on features and ratings]
   - Link: [Product Link]

[DATA] (KNOWLEDGE_BASE & POLICIES):
# PRODUCT LIST:
${products.map(p => `- ID: ${p.id} | Name: ${p.name} | Price: ${p.price.toLocaleString('vi-VN')} VND | Description: ${p.description} | Link: ${p.link} | Tags: ${(p.tags || []).join(', ')} | Rating: ${p.rating || 4.8}/5 (${p.reviews || 100} reviews)`).join('\n')}

# STORE POLICIES:
${STORE_POLICIES.map(policy => `- ${policy}`).join('\n')}

[JSON RESPONSE FORMAT]
Respond with this schema:
{
  "content": "Message content in English language",
  "suggestedProductIds": ["id1", "id2"],
  "status": "normal" | "no-results" | "out-of-scope"
}
`;
  }

  const roleText = customPrompt || `Bạn là trợ lý bán hàng bằng AI tài ba, nhiệt huyết, hỗ trợ tư vấn các sản phẩm công nghệ chất lượng hàng đầu. Xưng hô: "Shop" và "Bạn".`;

  let lengthGuideline = "";
  if (aiResponseLength === 1) {
    lengthGuideline = "CỰC KỲ QUAN TRỌNG: Câu trả lời phải cực kỳ ngắn gọn, cô đọng, dưới 50 từ và đi thẳng vào vấn đề.";
  } else if (aiResponseLength === 3) {
    lengthGuideline = "Câu trả lời có thể chi tiết, đầy đủ thông tin, kéo dài đến 250 từ nếu cần thiết.";
  } else {
    lengthGuideline = "CỰC KỲ QUAN TRỌNG: Giữ độ dài câu trả lời ở mức vừa phải, dưới 120 từ.";
  }

  const upsellGuideline = aiUpsell 
    ? "Khi khách chọn được sản phẩm chính hoặc có ý định mua: Hãy chủ động gợi ý thêm 1 phụ kiện hoặc dịch vụ liên quan có trong [DATA] (Ví dụ: mua điện thoại thì gợi ý dán cường lực, tai nghe, sạc dự phòng)."
    : "Tập trung giải đáp đúng yêu cầu của khách hàng, TRÁNH quảng cáo chéo hay cố gắng bán thêm (upsell) các sản phẩm phụ kiện khác trừ khi khách hàng chủ động yêu cầu.";

  const branchGuideline = aiSuggestOtherBranches
    ? "Nếu sản phẩm khách yêu cầu hết hàng ở chi nhánh này: Hãy tra cứu chi nhánh khác và chủ động gợi ý khách hàng mua hàng tại các chi nhánh còn hàng khác để thuận tiện nhất."
    : "Nếu sản phẩm hết hàng hoặc chưa hỗ trợ: Hãy báo hết hàng chân thành và gợi ý sản phẩm thay thế tương đương cùng loại.";

  return `
[ROLE_AND_SYSTEM_INSTRUCTION]
${roleText}

[TASK] 
Đọc tin nhắn của khách hàng, phân tích nhu cầu, tìm trong [DATA] bên dưới và đề xuất từ 1 đến ${aiMaxProducts} sản phẩm phù hợp nhất.

[RULES]
1. ${lengthGuideline}
2. TUYỆT ĐỐI KHÔNG trả lời các câu hỏi ngoài phạm vi mua sắm, tư vấn sản phẩm. Nếu khách hỏi lạc đề, hãy trả về content: "Tôi chỉ có thể tư vấn về sản phẩm tại TechShop. Bạn muốn tìm gì trong cửa hàng?" và status: "out-of-scope".
3. KHÔNG bịa đặt thông tin. Tuyệt đối không tự bịa ra sản phẩm, giá cả, hoặc khuyến mãi không có trong [DATA].
4. Đặc biệt khi tư vấn Laptop: PHẢI đề xuất từ 2 đến 3 mẫu laptop khác nhau dựa trên số lượt đánh giá (reviews) và điểm đánh giá (rating) cao nhất từ [DATA].
5. Nếu khách hàng hỏi chung chung (ví dụ: "Sản phẩm nào tốt?", "Tư vấn cho mình"): Hãy hỏi lại DUY NHẤT 1 câu để gom vùng giá hoặc sở thích/nhu cầu cụ thể. Đừng đề xuất sản phẩm ngay nếu chưa rõ.
6. Nếu khách tìm sản phẩm KHÔNG CÓ hoặc HẾT HÀNG: ${branchGuideline} Nếu tuyệt đối không có gì liên quan, hãy trả về content: "Tôi chưa tìm thấy sản phẩm phù hợp với yêu cầu này. Bạn có thể mô tả thêm không?" và suggestedProductIds: [].
7. ${upsellGuideline}
8. Nếu khách hàng cáu gắt, khiếu nại hoặc có thái độ tiêu cực: Hãy xin lỗi chân thành và xuất ra chuỗi [CALL_HUMAN] ở cuối tin nhắn để nhân viên hỗ trợ kịp thời.
9. Khi đề xuất sản phẩm, bắt buộc trình bày theo định dạng list:
   - Tên: [Tên Sản Phẩm] | Giá: [Giá tiền]
   - Lý do chọn: [1 câu tóm tắt dựa trên tính năng và đánh giá]
   - Link: [Link sản phẩm]

[DATA] (KNOWLEDGE_BASE & POLICIES):
# DANH SÁCH SẢN PHẨM:
${products.map(p => `- ID: ${p.id} | Tên: ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Mô tả: ${p.description} | Link: ${p.link} | Tag: ${(p.tags || []).join(', ')} | Đánh giá: ${p.rating || 4.8}/5 (${p.reviews || 100} lượt)`).join('\n')}

# CHÍNH SÁCH CỬA HÀNG:
${STORE_POLICIES.map(policy => `- ${policy}`).join('\n')}

[PHẢN HỒI JSON]
Trả về cấu trúc:
{
  "content": "Nội dung tin nhắn",
  "suggestedProductIds": ["id1", "id2"],
  "status": "normal" | "no-results" | "out-of-scope"
}
`;
}

export async function getAssistantResponse(userMessage: string, history: { role: string; content: string }[] = []) {
  const isEn = typeof window !== 'undefined' && localStorage.getItem('remix_lang') === 'en';
  try {
    const products = getActiveProducts();
    const systemInstruction = getSystemInstruction(products);

    // Retrieve active dynamic values for the model request
    let customTemp = 0.7;
    let customTokens = 2048;
    try {
      if (typeof window !== 'undefined') {
        const settingsStr = localStorage.getItem('remix_settings');
        if (settingsStr) {
          const settings = JSON.parse(settingsStr);
          if (settings.temperature !== undefined) customTemp = parseFloat(settings.temperature);
          if (settings.aiResponseLength !== undefined) {
            const rLength = parseInt(settings.aiResponseLength, 10);
            if (rLength === 1) customTokens = 512;
            else if (rLength === 3) customTokens = 4096;
            else customTokens = 2048;
          } else if (settings.maxTokens !== undefined) {
            customTokens = parseInt(settings.maxTokens, 10);
          }
        } else {
          const savedTemp = localStorage.getItem('remix_ai_temperature');
          if (savedTemp) customTemp = parseFloat(savedTemp);
          
          const savedLength = localStorage.getItem('remix_ai_response_length');
          if (savedLength) {
            const rLength = parseInt(savedLength, 10);
            if (rLength === 1) customTokens = 512;
            else if (rLength === 3) customTokens = 4096;
            else customTokens = 2048;
          } else {
            const savedTokens = localStorage.getItem('remix_ai_max_tokens');
            if (savedTokens) customTokens = parseInt(savedTokens);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load custom AI temperature and tokens from remix_settings", e);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: customTemp,
        maxOutputTokens: customTokens,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            suggestedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            status: { type: Type.STRING, enum: ["normal", "no-results", "out-of-scope"] }
          },
          required: ["content", "suggestedProductIds", "status"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const suggestions = (result.suggestedProductIds || [])
      .map((id: string) => products.find(p => p.id === id))
      .filter(Boolean) as Product[];

    return {
      content: result.content || (isEn ? "Sorry, Shop encountered a small issue, could you try asking again?" : "Xin lỗi, Shop gặp chút trục trặc, Bạn có thể hỏi lại được không?"),
      suggestions,
      status: result.status || (suggestions.length === 0 ? 'no-results' : 'normal')
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      content: isEn ? "System is currently busy. Please try again in secondary seconds." : "Hệ thống đang bận. Vui lòng thử lại sau ít giây.",
      suggestions: [],
      status: 'busy'
    };
  }
}

export async function generateChatTitle(messages:{ role: string; content: string }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { 
          role: 'user', 
          parts: [{ 
            text: `Dựa vào nội dung hội thoại sau, hãy tạo một tiêu đề cực ngắn (dưới 5 từ) tóm tắt mục đích chính của khách hàng. Không dùng dấu ngoặc, không dùng từ "Tiêu đề:".
            
            Hội thoại:
            ${messages.map(m => `${m.role === 'user' ? 'Khách' : 'AI'}: ${m.content}`).join('\n')}` 
          }] 
        }
      ]
    });

    return response.text.trim() || "Cuộc hội thoại mới";
  } catch (error) {
    console.error("Title Generation Error:", error);
    return "Phiên tư vấn mới";
  }
}

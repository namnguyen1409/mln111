import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Topic from "@/models/Topic";
import Quiz from "@/models/Quiz";
import MindMap from "@/models/MindMap";

export async function POST() {
    await connectDB();

    const seedTopics = [
        {
            title: "Triết học và vai trò của Triết học trong đời sống xã hội",
            slug: "triet-hoc-vai-tro",
            category: "co-ban",
            learningOutcome: "Nắm vững vấn đề cơ bản của triết học và các chức năng của thế giới quan, phương pháp luận.",
            content: {
                coreConcept: "Triết học là hệ thống quan điểm lý luận chung nhất về thế giới và vị trí của con người trong thế giới đó.",
                keyPoints: [
                    "Vấn đề cơ bản của triết học: Mối quan hệ giữa tư duy và tồn tại.",
                    "Chức năng thế giới quan: Giúp con người định hướng trong cuộc sống.",
                    "Chức năng phương pháp luận: Cung cấp những nguyên tắc chung cho hoạt động nhận thức và thực tiễn."
                ],
                example: "Việc xác định mục đích sống và đạo đức nghề nghiệp là biểu hiện của thế giới quan triết học.",
                thoughtQuestion: "Bạn theo đuổi chủ nghĩa duy vật hay duy tâm trong cách giải quyết các vấn đề hàng ngày?"
            }
        },
        {
            title: "Vật chất và Ý thức",
            slug: "vat-chat-y-thuc",
            category: "co-ban",
            learningOutcome: "Hiểu rõ mối quan hệ biện chứng giữa vật chất và ý thức, từ đó áp dụng vào thực tế tôn trọng khách quan.",
            content: {
                coreConcept: "Vật chất là thực tại khách quan, có trước và quyết định ý thức. Ý thức là sự phản ánh sáng tạo thực tại khách quan vào bộ óc con người.",
                keyPoints: [
                    "Vật chất quyết định nguồn gốc, nội dung và sự biến đổi của ý thức.",
                    "Ý thức có tính độc lập tương đối và tác động trở lại vật chất thông qua hoạt động thực tiễn.",
                    "Mối quan hệ biện chứng đòi hỏi phải tôn trọng khách quan và phát huy tính năng động chủ quan."
                ],
                example: "Dân gian có câu 'Có thực mới vực được đạo' - phản ánh sự quyết định của vật chất đối với tinh thần.",
                thoughtQuestion: "Làm thế nào để phát huy sức mạnh của ý thức (ý chí, tri thức) trong việc thay đổi hoàn cảnh khó khăn?"
            }
        },
        {
            title: "Hai nguyên lý của Phép biến chứng duy vật",
            slug: "hai-nguyen-ly-pbcdv",
            category: "nguyen-ly",
            learningOutcome: "Nắm chắc các nguyên tắc toàn diện và phát triển để xem xét sự vật hiện tượng một cách khoa học.",
            content: {
                coreConcept: "Nguyên lý về mối liên hệ phổ biến và Nguyên lý về sự phát triển.",
                keyPoints: [
                    "Mọi sự vật, hiện tượng đều nằm trong mối liên hệ ràng buộc lẫn nhau.",
                    "Sự phát triển là xu hướng chung của mọi sự vật theo hướng từ thấp đến cao.",
                    "Phải có quan điểm toàn diện và lịch sử - cụ thể khi xem xét sự vật."
                ],
                example: "Sự phát triển của nền kinh tế Việt Nam không tách rời nền kinh tế thế giới (Mối liên hệ phổ biến).",
                thoughtQuestion: "Tại sao nói muốn thành công cần phải có cái nhìn toàn diện?"
            }
        },
        {
            title: "Quy luật Lượng - Chất",
            slug: "quy-luat-luong-chat",
            category: "quy-luat",
            learningOutcome: "Hiểu quy luật tích lũy lượng để biến đổi chất, tránh tư tưởng nóng vội hoặc trì trệ.",
            content: {
                coreConcept: "Sự thay đổi về lượng khi đạt đến điểm nút sẽ dẫn đến sự thay đổi về chất.",
                keyPoints: [
                    "Lượng: Chỉ tính quy định khách quan về số lượng, quy mô...",
                    "Chất: Chỉ tính quy định khách quan vốn có, phân biệt nó với cái khác.",
                    "Độ: Khoảng giới hạn mà sự thay đổi về lượng chưa làm thay đổi về chất."
                ],
                example: "Việc học tập tích lũy kiến thức mỗi ngày (lượng) giúp sinh viên vượt qua kỳ thi và nhận bằng (biến đổi về chất).",
                thoughtQuestion: "Bạn đang ở 'độ' nào trong quá trình rèn luyện kỹ năng của mình?"
            }
        },
        {
            title: "Quy luật Mâu thuẫn",
            slug: "quy-luat-mau-thuan",
            category: "quy-luat",
            learningOutcome: "Biết cách phát hiện và giải quyết mâu thuẫn để tạo ra động lực phát triển bản thân.",
            content: {
                coreConcept: "Mâu thuẫn là nguồn gốc và động lực của sự vận động, phát triển.",
                keyPoints: [
                    "Mâu thuẫn là sự thống nhất và đấu tranh giữa các mặt đối lập.",
                    "Sự đấu tranh giữa các mặt đối lập là tuyệt đối, sự thống nhất là tương đối.",
                    "Giải quyết mâu thuẫn là phương thức để sự vật chuyển sang trạng thái mới."
                ],
                example: "Trong kinh tế, mâu thuẫn giữa Cung và Cầu thúc đẩy sự vận động của thị trường.",
                thoughtQuestion: "Có phải mọi mâu thuẫn trong cuộc sống đều xấu hay không?"
            }
        }
    ];

    const seedQuizzes = [
        {
            title: "Thử thách Lượng & Chất",
            topicSlug: "quy-luat-luong-chat",
            xpReward: 100,
            questions: [
                {
                    question: "Trong quy luật Lượng - Chất, 'Độ' là gì?",
                    options: [
                        "Điểm mà tại đó chất biến đổi thành lượng",
                        "Khoảng giới hạn mà sự thay đổi về lượng chưa làm thay đổi về chất",
                        "Sự biến đổi hoàn toàn về chất",
                        "Điểm nút của sự phát triển"
                    ],
                    correctAnswer: 1,
                    explanation: "Độ là khoảng giới hạn mà trong đó sự thay đổi về lượng chưa dẫn đến sự thay đổi căn bản về chất của sự vật."
                },
                {
                    question: "Muốn thay đổi về chất của sự vật, ta phải làm gì?",
                    options: [
                        "Giữ nguyên lượng",
                        "Tích lũy về lượng đến một giới hạn nhất định (điểm nút)",
                        "Chỉ cần thay đổi hình thức bên ngoài",
                        "Đợi sự vật tự biến đổi"
                    ],
                    correctAnswer: 1,
                    explanation: "Sự thay đổi về chất chỉ xảy ra khi sự tích lũy về lượng đạt tới điểm nút."
                }
            ]
        }
    ];

    try {
        await Topic.deleteMany({}); // Optional: clear existing to avoid schema conflicts or duplicates
        await Topic.insertMany(seedTopics);

        const quizCount = await Quiz.countDocuments();
        if (quizCount === 0) {
            await Quiz.insertMany(seedQuizzes);
        }

        // Seed MindMap
        const seedMindMaps = [
            {
                title: "Hệ thống tri thức MLN111",
                slug: "he-thong-tri-thuc",
                description: "Sơ đồ tổng quát về mối quan hệ giữa các Nguyên lý, Quy luật và Phạm trù trong Phép biện chứng duy vật.",
                nodes: [
                    { id: 'root', label: 'PHÉP BIỆN CHỨNG DUY VẬT', type: 'root', x: 500, y: 350, description: 'Linh hồn sống của chủ nghĩa Mác, là học thuyết về mối liên hệ phổ biến và về sự phát triển.' },
                    { id: 'nly1', label: 'Liên hệ phổ biến', type: 'principle', x: 300, y: 200, description: 'Mọi sự vật hiện tượng không tồn tại biệt lập mà liên hệ, ràng buộc nhau.' },
                    { id: 'nly2', label: 'Sự phát triển', type: 'principle', x: 700, y: 200, description: 'Sự vận động theo hướng đi lên từ thấp đến cao, từ đơn giản đến phức tạp.' },
                    { id: 'ql1', label: 'Lượng - Chất', type: 'law', x: 300, y: 500, description: 'Tích lũy về lượng dẫn đến sự biến đổi về chất.' },
                    { id: 'ql2', label: 'Mâu thuẫn', type: 'law', x: 500, y: 550, description: 'Nguồn gốc và động lực của sự phát triển.' },
                    { id: 'ql3', label: 'Phủ định của phủ định', type: 'law', x: 700, y: 500, description: 'Khuynh hướng của sự phát triển là chu kỳ quanh co nhưng đi lên.' }
                ],
                connections: [
                    { from: 'root', to: 'nly1' },
                    { from: 'root', to: 'nly2' },
                    { from: 'root', to: 'ql1' },
                    { from: 'root', to: 'ql2' },
                    { from: 'root', to: 'ql3' }
                ]
            }
        ];

        await MindMap.deleteMany({});
        await MindMap.insertMany(seedMindMaps);

        return NextResponse.redirect(new URL('/learn', 'http://localhost:3000'));
    } catch (error: any) {
        return NextResponse.json({ error: "Seed failed", details: error.message }, { status: 500 });
    }
}

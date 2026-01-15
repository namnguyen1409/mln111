import React from 'react';

export default function StructuredData() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Triết Học PlayHub",
        "description": "Nền tảng học tập tương tác cho môn Triết học Mác-Lênin cho sinh viên Việt Nam.",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "author": {
            "@type": "Person",
            "name": "Team MLN111"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1200"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

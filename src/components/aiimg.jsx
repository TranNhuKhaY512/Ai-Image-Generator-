import React, { useState, useEffect } from 'react';
import './generative_ai.css';

const examplePrompts = [
  "A serene landscape with mountains and a lake at sunset",
  "A futuristic city with flying cars and neon lights",
  "A magical forest with glowing mushrooms and fairies",
  "An underwater scene with colorful coral reefs and tropical fish",
  "A cozy cabin in the woods during winter"
];

const API_KEY = "";

function SinglePage() {
  const [theme, setTheme] = useState('light');
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  useEffect(() => {
    // Lấy theme từ localStorage hoặc sử dụng theme mặc định
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme);
  };

  const handleRandomPrompt = () => {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Vui lòng nhập mô tả!");
      return;
    }

    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả!');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrls([]);

    const MODEL_URL = `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell`;
    const { width, height } = getImageDimensions(aspectRatio);

    try {
      const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        const response = await fetch(MODEL_URL, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: width,
              height: height,
              num_inference_steps: 50,
              guidance_scale: 7.5
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Có lỗi xảy ra khi tạo ảnh');
        }

        const result = await response.blob();
        return URL.createObjectURL(result);
      });

      const results = await Promise.allSettled(imagePromises);
      const successfulUrls = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUrls.length === 0) {
        throw new Error('Không thể tạo bất cứ ảnh nào');
      }

      setImageUrls(successfulUrls);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo ảnh');
    } finally {
      setLoading(false);
    }
  };

  const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
    return { width: calculatedWidth, height: calculatedHeight };
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-wrapper">
          <div className="logo">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h1>Bạn cần xây dựng <span>hình ảnh</span> gì ? </h1>
        </div>
        <div className="theme-switch-wrapper">
          <span className="theme-label"></span>
          <label className="theme-switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={handleThemeToggle}
            />
            <span className="theme-slider"></span>
          </label>
          <span className="theme-label"></span>
        </div>
      </header>

      <main className="main-content">
        <form onSubmit={handleFormSubmit} className="prompt-form">
          <div className="prompt-container">
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Hãy nhập mô tả của bạn...(*lưu ý: nhập bằng tiếng Anh)"
              required
              autoFocus
            />
            <button
              type="button"
              className="prompt-btn"
              onClick={handleRandomPrompt}
            >
              <i className="fa-solid fa-dice"></i>
            </button>
          </div>

          <div className="prompt-actions">
            <div className="select-wrapper">
              <select
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="custom-select"
                required
              >
                <option value="" >Số lượng ảnh</option>
                <option value="1">1 Ảnh</option>
                <option value="2">2 Ảnh</option>
              </select>
            </div>
            <div className="select-wrapper">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="custom-select"
                required
              >
                <option value="" >Tỉ lệ khung hình</option>
                <option value="1/1">(1:1)</option>
                <option value="16/9">(16:9)</option>
                <option value="9/16">(9:16)</option>
              </select>
            </div>
            <button
              type="submit"
              className="generate-btn"
              disabled={loading}
            >
              <i className="fa-solid fa-wand-sparkles"></i>
              {loading ? 'Đang tạo...' : 'Tạo ảnh'}
            </button>

            <button
              className="clear-btn"
              onClick={() => {
                setImageUrls([]); // Xóa các hình ảnh đã tạo
                setPrompt(''); // Xóa nội dung mô tả
                setError(''); // Xóa thông báo lỗi
              }}
            >
              <i className="fas fa-trash-alt"></i> Xóa
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="gallery-grid">
            {loading && Array.from({ length: imageCount }).map((_, i) => (
              <div key={i} className="img-card loading" style={{ aspectRatio }}>
                <div className="status-container">
                  <div className="spinner"></div>
                  <p className="status-text">Đang tạo...</p>
                </div>
              </div>
            ))}
            {imageUrls.map((url, i) => (
              <div key={i} className="img-card" style={{ aspectRatio }}>
                <img src={url} alt={`Generated ${i + 1}`} className="result-img" />
                <div className="img-overlay">
                  <a href={url} className="img-download-btn" download={`${Date.now()}.png`}>
                    <i className="fa-solid fa-download"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </form>
      </main>
    </div>
  );
}

export default SinglePage;

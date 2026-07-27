// Vercel Serverless Function (Node.js runtime)
// NEIS_API_KEY는 Vercel 대시보드 Environment Variables에서 설정합니다.

export default async function handler(req, res) {
  // CORS 및 응답 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, officeCode, schoolCode, ym, searchQuery } = req.query;
  const apiKey = process.env.NEIS_API_KEY || '';

  try {
    let url = '';
    const keyParam = apiKey ? `&KEY=${apiKey}` : '';

    if (endpoint === 'schoolInfo') {
      // 학교 정보 검색 API
      url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=10${keyParam}&ATPT_OFCDC_SC_CODE=${officeCode}&SCHUL_NM=${encodeURIComponent(searchQuery || '')}`;
    } else if (endpoint === 'mealServiceDietInfo') {
      // 급식 정보 API
      url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=30${keyParam}&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${ym}`;
    } else if (endpoint === 'SchoolSchedule') {
      // 학사일정 API
      url = `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&pIndex=1&pSize=100${keyParam}&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&AA_YMD=${ym}`;
    } else {
      return res.status(400).json({ error: 'Invalid endpoint parameter provided.' });
    }

    const neisResponse = await fetch(url);
    const data = await neisResponse.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('NEIS Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from NEIS Open API', 
      details: error.message 
    });
  }
}
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default async function Icon() {
  // Fetch Krona One font from Google Fonts
  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/kronaone/v15/jAnEgHdjHcjgfIb1ZcUCMQ.ttf')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: 340,
          fontFamily: '"Krona One"',
        }}
      >
        P
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Krona One',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );
}

import React from 'react';



// Styles được định nghĩa bên ngoài component để tránh tạo lại mỗi lần render
const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  fontSize: '20px',
  zIndex: 10000,
  pointerEvents: 'auto',
};

const spinnerStyle = {
  border: '5px solid rgba(255,255,255,0.3)',
  borderTop: '5px solid #fff',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px',
};

const keyframesStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Hàm xử lý ngăn chặn sự kiện click được định nghĩa bên ngoài để không tạo mới mỗi lần render
const preventClickThrough = (e) => {
  //e.preventDefault();
  e.stopPropagation();
};

// Sử dụng React.memo để tránh render lại khi props không thay đổi
const LoadingOverlay = React.memo(({ showLoading }) => {
  if (!showLoading) return null;
  
  return (
    <>
      <div
        className="loading-overlay"
        style={overlayStyle}
        onClick={preventClickThrough}
        onMouseDown={preventClickThrough}
        onMouseUp={preventClickThrough}
        onTouchStart={preventClickThrough}
        onTouchEnd={preventClickThrough}
      >
        <div
          className="loading-spinner"
          style={spinnerStyle}
        ></div>
        {/* <p>Loading game modules...</p> */}
      </div>
      <style>
        {keyframesStyle}
      </style>
    </>
  );
});

export default LoadingOverlay;

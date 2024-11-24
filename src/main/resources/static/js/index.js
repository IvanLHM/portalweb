// 计算系统运行时间
document.addEventListener('DOMContentLoaded', function() {
    const startTime = new Date('2024-01-01').getTime(); // 设置系统上线时间
    
    function updateUptime() {
        const now = new Date().getTime();
        const diff = now - startTime;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('uptime').textContent = 
            `${days}天 ${hours}小时 ${minutes}分钟`;
    }
    
    updateUptime();
    setInterval(updateUptime, 60000); // 每分钟更新一次
}); 
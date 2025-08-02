export class Device {
    public isMobile = false;

    public isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Windows Phone|Opera Mini/i.test(navigator.userAgent);
    }
}

export const device = new Device();

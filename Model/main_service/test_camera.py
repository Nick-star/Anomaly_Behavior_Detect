import cv2

url = "http://video12:12video@10.2.4.129:10882/avreg-cgi/mjpg/video.cgi?camera=46"
cap = cv2.VideoCapture(url)

if not cap.isOpened():
    print("Не удалось открыть поток")
else:
    # Попробуем получить FPS (может быть недоступно для некоторых потоков)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        print("FPS не удалось определить, возможно, поток его не сообщает.")
    else:
        print(f"FPS: {fps}")

    # Получаем разрешение
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    print(f"Разрешение: {int(width)}x{int(height)}")

    # Альтернативный способ — вручную измерить FPS
    import time

    frame_count = 0
    start = time.time()

    for _ in range(60):  # протестировать на 60 кадрах
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1

    end = time.time()
    manual_fps = frame_count / (end - start)
    print(f"Реальный FPS (по времени): {manual_fps:.2f}")

cap.release()

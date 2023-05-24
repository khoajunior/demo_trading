
from flask import Flask, request, Response
from paddleocr import PaddleOCR, draw_ocr
app= Flask(__name__)

@app.route('/national_id', methods=['GET'])
def create_national_id():
  try:
    link = request.args.get("link", "")
    if(not link):
      return Response(response="image not found", status=400)

    print(link)
    ocr = PaddleOCR(lang="en", use_gpu=False) # The model file will be downloaded automatically when executed for the first time
    img_path = link
    result = ocr.ocr(img_path)
    # Recognition and detection can be performed separately through parameter control
    # result = ocr.ocr(img_path, det=True) # Only perform recognition
    # result = ocr.ocr(img_path, rec=True)  # Only perform detection
    # Print detection frame and recognition result
    dict_data = {

    }
    row = 0
    for line in result:
        row += 1
        dict_data[row]=  line[1][0]
        print(line[1][0])

    # # Visualization
    # from PIL import Image
    # image = Image.open(img_path).convert('RGB')
    # boxes = [line[0] for line in result]
    # txts = [line[1][0] for line in result]
    # scores = [line[1][1] for line in result]
    # im_show = draw_ocr(image, boxes, txts, scores, font_path='./latin.ttf')
    # im_show = Image.fromarray(im_show)
    # im_show.save('result.jpg')
    
    return dict_data
  except Exception as e:
    print(str(e))
    return Response(response="error", status=400)

if __name__ =='__main__':
  app.run()
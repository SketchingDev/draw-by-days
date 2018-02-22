package com.drawbydays.website.model;

public class ImageSequenceModel {

  private Image currentImage;

  private Image nextImage;

  public ImageSequenceModel() {
  }

  public ImageSequenceModel(final Image currentImage) {
    this.currentImage = currentImage;
  }

  public ImageSequenceModel(final Image currentImage, final Image nextImage) {
    this.currentImage = currentImage;
    this.nextImage = nextImage;
  }

  public Image getCurrentImage() {
    return currentImage;
  }

  public Image getNextImage() {
    return nextImage;
  }

  public void setCurrentImage(Image currentImage) {
    this.currentImage = currentImage;
  }

  public void setNextImage(Image nextImage) {
    this.nextImage = nextImage;
  }
}

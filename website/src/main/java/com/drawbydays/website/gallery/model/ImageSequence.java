package com.drawbydays.website.gallery.model;

public class ImageSequence {

  private Image currentImage;

  private Image nextImage;

  public ImageSequence() {
  }

  public ImageSequence(final Image currentImage) {
    this.currentImage = currentImage;
  }

  public ImageSequence(final Image currentImage, final Image nextImage) {
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

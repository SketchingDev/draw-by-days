package com.drawbydays.website.gallery;

import javax.persistence.Id;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import java.net.URI;

@Entity
public class Image {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long id;

  private URI uri;

  protected Image() {
  }

  public Image(final URI uri) {
    this.uri = uri;
  }

  public void setId(final long id) {
    this.id = id;
  }

  public void setUri(final URI uri) {
    this.uri = uri;
  }

  public long getId() {
    return this.id;
  }

  public URI getUri() {
    return this.uri;
  }
}

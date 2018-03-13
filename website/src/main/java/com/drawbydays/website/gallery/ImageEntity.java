package com.drawbydays.website.gallery;

import javax.persistence.Id;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import java.net.URI;

@Entity
public class ImageEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;

  private URI uri;

  protected ImageEntity() {
  }

  public ImageEntity(final URI uri) {
    this.uri = uri;
  }

  public void setId(final Long id) {
    this.id = id;
  }

  public void setUri(final URI uri) {
    this.uri = uri;
  }

  public Long getId() {
    return this.id;
  }

  public URI getUri() {
    return this.uri;
  }
}

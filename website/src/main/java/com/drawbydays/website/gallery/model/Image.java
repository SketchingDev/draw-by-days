package com.drawbydays.website.gallery.model;

import java.net.URI;
import java.util.Objects;

public class Image {

  private Long id;

  private URI uri;

  // TODO Make primitive
  public Image(final Long id, final URI uri) {
    this.id = Objects.requireNonNull(id);
    this.uri = Objects.requireNonNull(uri);
  }

  public Long getId() {
    return this.id;
  }

  public URI getUri() {
    return this.uri;
  }
}

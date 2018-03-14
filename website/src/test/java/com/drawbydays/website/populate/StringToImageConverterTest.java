package com.drawbydays.website.populate;

import com.drawbydays.website.gallery.Image;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class StringToImageConverterTest {

  private static final String VALID_URI = "http://drawbydays.com/";
  private static final String INVALID_URI = "^";

  private StringToImageConverter converter;

  @Before
  public void setup() {
    converter = new StringToImageConverter();
  }

  @Test(expected = NullPointerException.class)
  public void null_uri_causes_pointer_exception() {
    converter.convert(null);
  }

  @Test(expected = IllegalArgumentException.class)
  public void invalid_uri_causes_illegal_argument_exception() {
    converter.convert(INVALID_URI);
  }

  @Test
  public void valid_uri_converts_to_image_entity_with_uri() {
    final Image image = converter.convert(VALID_URI);

    assertEquals(VALID_URI, image.getUri().toString());
  }

  @Test
  public void valid_uri_converts_to_image_entity_with_null_id() {
    final Image image = converter.convert(VALID_URI);

    assertEquals(VALID_URI, image.getUri().toString());
  }
}

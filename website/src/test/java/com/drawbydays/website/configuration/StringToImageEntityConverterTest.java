package com.drawbydays.website.configuration;

import com.drawbydays.website.storage.ImageEntity;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class StringToImageEntityConverterTest {

  private static final String VALID_URI = "http://drawbydays.com/";
  private static final String INVALID_URI = "^";

  private StringToImageEntityConverter converter;

  @Before
  public void setup() {
    converter = new StringToImageEntityConverter();
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
    final ImageEntity imageEntity = converter.convert(VALID_URI);

    assertEquals(VALID_URI, imageEntity.getUri().toString());
  }

  @Test
  public void valid_uri_converts_to_image_entity_with_null_id() {
    final ImageEntity imageEntity = converter.convert(VALID_URI);

    assertEquals(VALID_URI, imageEntity.getUri().toString());
  }
}

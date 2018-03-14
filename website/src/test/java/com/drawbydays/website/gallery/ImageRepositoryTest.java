package com.drawbydays.website.gallery;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;
import java.util.Optional;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertFalse;

@RunWith(SpringRunner.class)
@DataJpaTest
public class ImageRepositoryTest {

  private static final URI DUMMY_TEST_URI_ONE = URI.create("test_uri1");
  private static final URI DUMMY_TEST_URI_TWO = URI.create("test_uri2");

  @Autowired
  private TestEntityManager entityManager;

  @Autowired
  private ImageRepository repository;

  @Test
  public void findNextElseFirstByOrderByIdAsc_returns_empty_optional_when_no_items_in_storage() {
    assertFalse(repository.findNextElseFirstByOrderByIdAsc(1L).isPresent());
  }

  @Test
  public void findNextElseFirstByOrderByIdAsc_returns_one_item_when_one_item_in_storage() {
    final Image image = new Image(DUMMY_TEST_URI_ONE);

    entityManager.persist(image);

    final Optional<Image> actualImageEntity = repository.findNextElseFirstByOrderByIdAsc(image.getId());

    assertTrue(actualImageEntity.isPresent());
    assertEquals(image, actualImageEntity.get());
  }

  @Test
  public void findNextElseFirstByOrderByIdAsc_returns_next_item() {
    final Image imageOne = new Image(DUMMY_TEST_URI_ONE);
    final Image imageTwo = new Image(DUMMY_TEST_URI_TWO);

    entityManager.persist(imageOne);
    entityManager.persist(imageTwo);

    final Optional<Image> actualImageEntity = repository.findNextElseFirstByOrderByIdAsc(imageOne.getId());

    assertTrue(actualImageEntity.isPresent());
    assertEquals(imageTwo, actualImageEntity.get());
  }

  @Test
  public void findNextElseFirstByOrderByIdAsc_returns_first_item_when_last_image_provided() {
    final Image imageOne = new Image(DUMMY_TEST_URI_ONE);
    final Image imageTwo = new Image(DUMMY_TEST_URI_TWO);

    entityManager.persist(imageOne);
    entityManager.persist(imageTwo);

    final Optional<Image> actualImageEntity = repository.findNextElseFirstByOrderByIdAsc(imageTwo.getId());

    assertTrue(actualImageEntity.isPresent());
    assertEquals(imageOne, actualImageEntity.get());
  }
}

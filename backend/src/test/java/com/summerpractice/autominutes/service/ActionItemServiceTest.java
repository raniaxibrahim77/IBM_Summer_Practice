package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.ActionItemResponse;
import com.summerpractice.autominutes.model.ActionItem;
import com.summerpractice.autominutes.repository.ActionItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActionItemServiceTest {

    @Mock
    private ActionItemRepository actionItemRepository;

    @InjectMocks
    private ActionItemService actionItemService;

    @Test
    void shouldUpdateActionItemStatusToDone() {
        UUID actionItemId = UUID.randomUUID();

        ActionItem actionItem =
                new ActionItem(null, "Prepare meeting report");

        actionItem.setId(actionItemId);

        when(actionItemRepository.findById(actionItemId))
                .thenReturn(Optional.of(actionItem));

        when(actionItemRepository.save(actionItem))
                .thenReturn(actionItem);

        ActionItemResponse response =
                actionItemService.updateStatus(
                        actionItemId,
                        "DONE"
                );

        assertEquals(actionItemId, response.getId());
        assertEquals("DONE", response.getStatus());
        assertNotNull(response.getUpdatedAt());

        verify(actionItemRepository).findById(actionItemId);
        verify(actionItemRepository).save(actionItem);
    }

    @Test
    void shouldThrowWhenActionItemDoesNotExist() {
        UUID actionItemId = UUID.randomUUID();

        when(actionItemRepository.findById(actionItemId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> actionItemService.updateStatus(
                        actionItemId,
                        "DONE"
                )
        );

        assertTrue(
                exception.getMessage()
                        .contains("Action item not found")
        );

        verify(actionItemRepository).findById(actionItemId);
        verify(actionItemRepository, never()).save(any());
    }
}
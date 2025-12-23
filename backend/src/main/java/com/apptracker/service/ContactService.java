package com.apptracker.service;

import com.apptracker.dto.*;
import com.apptracker.model.*;
import com.apptracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final ApplicationService applicationService;
    private final ActivityRepository activityRepository;

    public ContactService(ContactRepository contactRepository,
            ApplicationService applicationService,
            ActivityRepository activityRepository) {
        this.contactRepository = contactRepository;
        this.applicationService = applicationService;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public Contact createContact(UUID userId, UUID appId, CreateContactRequest request) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);

        Contact contact = new Contact();
        contact.setApplicationId(appId);
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setLinkedinUrl(request.getLinkedinUrl());
        contact.setPhone(request.getPhone());
        contact.setNotes(request.getNotes());

        Contact saved = contactRepository.save(contact);

        // Log activity
        Activity activity = new Activity();
        activity.setApplicationId(appId);
        activity.setType(Activity.ActivityType.CONTACT_ADDED);
        activity.setMessage("Contact added: " + request.getName());
        activityRepository.save(activity);

        return saved;
    }

    public List<Contact> getContacts(UUID userId, UUID appId) {
        // Verify ownership
        applicationService.getApplicationEntityById(userId, appId);
        return contactRepository.findByApplicationIdOrderByCreatedAtDesc(appId);
    }
}

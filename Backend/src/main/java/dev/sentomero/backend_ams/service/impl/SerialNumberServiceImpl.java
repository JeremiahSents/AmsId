package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.service.SerialNumberService;
import dev.sentomero.backend_ams.repository.KpClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

@Service
public class SerialNumberServiceImpl implements SerialNumberService {
    private static final long STARTING_SERIAL = 5000L;
    private static final long MAX_SERIAL = 99999L;

    private final KpClientRepository kpClientRepository;

    @Autowired
    public SerialNumberServiceImpl(KpClientRepository kpClientRepository) {
        this.kpClientRepository = kpClientRepository;
    }

    @Override
    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    public Long generateSerialNumber() {
        // Get the highest serial number currently in use
        Optional<Long> maxSerial = kpClientRepository.findHighestSerialNumber();

        // If no serial numbers exist, start from STARTING_SERIAL
        long nextSerial = maxSerial.map(serial -> serial + 1)
                .orElse(STARTING_SERIAL);

        // If we've reached the maximum, look for gaps in the sequence
        if (nextSerial > MAX_SERIAL) {
            Optional<Long> gap = findFirstAvailableGap();
            if (gap.isPresent()) {
                nextSerial = gap.get();
            } else {
                throw new IllegalStateException("No available serial numbers in the valid range");
            }
        }

        // Verify the generated number isn't already in use (extra safety check)
        if (kpClientRepository.existsBySerialNumber(nextSerial)) {
            throw new IllegalStateException("Generated serial number " + nextSerial + " is already in use");
        }

        return nextSerial;
    }

    private Optional<Long> findFirstAvailableGap() {
        // Get all serial numbers in order
        var usedSerials = kpClientRepository.findAllSerialNumbersOrdered();

        // Look for the first gap in the sequence starting from STARTING_SERIAL
        long expectedSerial = STARTING_SERIAL;
        for (Long usedSerial : usedSerials) {
            if (expectedSerial < usedSerial) {
                // Found a gap
                return Optional.of(expectedSerial);
            }
            expectedSerial = usedSerial + 1;
        }

        return Optional.empty();
    }
}
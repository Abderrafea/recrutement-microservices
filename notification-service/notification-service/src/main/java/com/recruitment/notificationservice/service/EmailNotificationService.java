package com.recruitment.notificationservice.service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final MailProperties mailProperties;

    public void sendHtmlEmail(String recipient, String subject, String templateName, Map<String, Object> model) {
        if (recipient == null || recipient.isBlank()) {
            log.warn("Skipping email '{}' because recipient is blank", subject);
            return;
        }

        Context context = new Context();
        model.forEach(context::setVariable);
        String html = templateEngine.process(templateName, context);

        if (mailProperties.getUsername() == null || mailProperties.getUsername().isBlank()) {
            log.info("Mail credentials are not configured. Email to '{}' with subject '{}' rendered only.\n{}",
                    recipient, subject, html);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException exception) {
            log.error("Unable to send email '{}' to '{}'", subject, recipient, exception);
        }
    }
}

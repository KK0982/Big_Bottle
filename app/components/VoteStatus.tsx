"use client";

import { VStack, HStack, Text, Badge, Box, Flex, Icon } from "@chakra-ui/react";
import { useVotePreference } from "../hooks/use-vote-preference";
import { useUserInfo } from "../hooks/use-user-info";
import { CheckIcon, WarningIcon } from "@chakra-ui/icons";

export function VoteStatus() {
  const { userInfo } = useUserInfo();
  const { votePreferenceData, loading } = useVotePreference(
    userInfo.account || undefined
  );

  if (loading) {
    return (
      <Box bg="gray.50" borderRadius="1rem" p="1rem">
        <Text fontSize="0.875rem" color="gray.600">
          Loading vote status...
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing="1rem" align="stretch">
      {/* Voting Eligibility */}
      <Box bg="gray.50" borderRadius="1rem" p="1rem">
        <VStack spacing="0.75rem" align="stretch">
          <Text fontSize="1rem" fontWeight="semibold" color="gray.900">
            Voting Status
          </Text>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              Can Vote
            </Text>
            <HStack spacing="0.25rem">
              <Icon
                as={votePreferenceData.canVote ? CheckIcon : WarningIcon}
                color={votePreferenceData.canVote ? "green.500" : "orange.500"}
                boxSize="0.875rem"
              />
              <Badge
                colorScheme={votePreferenceData.canVote ? "green" : "orange"}
                size="sm"
              >
                {votePreferenceData.canVote ? "Eligible" : "Not Eligible"}
              </Badge>
            </HStack>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              VOT3 Balance
            </Text>
            <Text fontSize="0.875rem" fontWeight="medium">
              {votePreferenceData.vot3Balance.toFixed(2)}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              Staked Amount
            </Text>
            <Text fontSize="0.875rem" fontWeight="medium">
              {votePreferenceData.stakedAmount.toFixed(2)} B3TR
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Delegation Status */}
      <Box bg="gray.50" borderRadius="1rem" p="1rem">
        <VStack spacing="0.75rem" align="stretch">
          <Text fontSize="1rem" fontWeight="semibold" color="gray.900">
            Delegation Status
          </Text>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              Voting Power Delegated
            </Text>
            <Badge
              colorScheme={votePreferenceData.isDelegated ? "blue" : "gray"}
              size="sm"
            >
              {votePreferenceData.isDelegated ? "Yes" : "No"}
            </Badge>
          </HStack>

          {votePreferenceData.isDelegated && votePreferenceData.delegatedTo && (
            <VStack spacing="0.25rem" align="stretch">
              <Text fontSize="0.75rem" color="gray.500">
                Delegated To:
              </Text>
              <Text
                fontSize="0.75rem"
                fontFamily="mono"
                color="gray.700"
                wordBreak="break-all"
              >
                {votePreferenceData.delegatedTo}
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Vote Preferences */}
      <Box bg="gray.50" borderRadius="1rem" p="1rem">
        <VStack spacing="0.75rem" align="stretch">
          <Text fontSize="1rem" fontWeight="semibold" color="gray.900">
            Vote Preferences
          </Text>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              Auto Vote Enabled
            </Text>
            <Badge
              colorScheme={
                votePreferenceData.votePreference.autoVoteEnabled
                  ? "green"
                  : "gray"
              }
              size="sm"
            >
              {votePreferenceData.votePreference.autoVoteEnabled ? "On" : "Off"}
            </Badge>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="0.875rem" color="gray.600">
              Preferences Set
            </Text>
            <Badge
              colorScheme={
                votePreferenceData.votePreference.isActive ? "blue" : "gray"
              }
              size="sm"
            >
              {votePreferenceData.votePreference.isActive ? "Active" : "None"}
            </Badge>
          </HStack>

          {votePreferenceData.votePreference.preferredApps.length > 0 && (
            <VStack spacing="0.25rem" align="stretch">
              <Text fontSize="0.75rem" color="gray.500">
                Preferred Apps (
                {votePreferenceData.votePreference.preferredApps.length}):
              </Text>
              {votePreferenceData.votePreference.preferredApps
                .slice(0, 3)
                .map((app, index) => (
                  <Text
                    key={index}
                    fontSize="0.75rem"
                    fontFamily="mono"
                    color="gray.700"
                    wordBreak="break-all"
                  >
                    {app}
                  </Text>
                ))}
              {votePreferenceData.votePreference.preferredApps.length > 3 && (
                <Text fontSize="0.75rem" color="gray.500">
                  ... and{" "}
                  {votePreferenceData.votePreference.preferredApps.length - 3}{" "}
                  more
                </Text>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}

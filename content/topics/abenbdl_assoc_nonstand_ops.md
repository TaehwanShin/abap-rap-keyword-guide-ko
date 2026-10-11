---
title: association 의 non-standard operation
summary: association 에 붙이는 미리 정해진 non-standard operation 인 link action, unlink action, inverse function 을 묶은 갈래입니다.
keywords: NonstandardOperationsForAssoc, link action, unlink action, inverse function, 비표준 작업, 연관 관계, 외래 키, 연결, 연결 끊기, 역함수
---

## 설명

association 의 non-standard operation(비표준 작업)은 association 의 소스에서 대상으로 가는 길 위에서 움직이지만, 읽기·생성 같은 standard operation(표준 작업)과는 다른 일을 합니다. 직접 이름을 붙여 선언하고, 하는 일은 RAP 가 미리 정해 두었습니다.

다루는 것은 모두 **외래 키**입니다. link action 은 소스 인스턴스의 외래 키를 채워 두 인스턴스를 잇고, unlink action 은 외래 키를 비워 이어진 것을 끊습니다. inverse function 은 거꾸로, 외래 키 값을 받아 그 값에 맞는 소스 인스턴스를 찾아 줍니다.

선언하는 자리는 association 의 중괄호 안입니다. 전체 틀은 [[abenbdl_association]] 에 있습니다.

## 관련 항목

- [[abenbdl_link_unlink_action]] : link action 은 외래 키를 넣어 한 entity(엔터티) 인스턴스를 다른 entity 인스턴스와 잇습니다. 같은 BO 안의 association 에도, 다른 BO 로 가는 association 에도 정의할 수 있습니다. unlink action 은 외래 키 필드 값을 지워 이어진 두 인스턴스를 끊습니다.
- [[abenbdl_inverse_funct]] : 연관 대상 인스턴스의 외래 키 필드 값을 입력으로 받아, 거기에 맞는 연관 소스 인스턴스를 결과로 돌려줍니다. 예를 들어 다른 BO 로 가는 association 에서 read-by-association 을 할 수 있게 하는 데 씁니다.
- [[abenbdl_assoc_stand_ops]] : read-by-association 과 create-by-association.
- [[abenbdl_association]] : association 작업 전체 문법.
